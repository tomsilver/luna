import json
import os
import requests


# Constants
BASE_URL = 'http://ec2-52-23-169-221.compute-1.amazonaws.com/'
VERBOSITY = 1

# Utilities
def printv(s, v=1):
	if v <= VERBOSITY:
		print s

def formatRequest(endpoint, token, data=None, baseUrl=BASE_URL):
	url = BASE_URL+endpoint
	headers = {'Authorization': 'Bearer '+token}
	rargs = {'url': url, 'headers': headers }
	if data is not None:
		rargs['data'] = data
	return rargs


# Single Luna Game
class LunaGame(object):
	def __init__(self, gameId, phase, turn, questions, responseFn, guessFn):
		self.gameId = gameId
		self.gameUrl = os.path.join('home', self.gameId)
		self.phase = phase
		self.turn = turn
		self.questions = questions
		self.responseFn = responseFn
		self.guessFn = guessFn

		self.opQuestions = []
		self.opResponses = []
		self.opGuess = -1
		self.outcome = None

	def _interview(self, token):
		endpoint = os.path.join(self.gameUrl, 'interview')
		data = {'questions': self.questions}
		rargs = formatRequest(endpoint, token, data)
		requests.post(**rargs)

	def _respond(self, token):
		if len(self.opQuestions) == 0:
			raise Exception("Cannot respond until questions are received.")

		endpoint = os.path.join(self.gameUrl, 'response')
		responses = [self.responseFn(q) for q in self.opQuestions]
		data = {'responses': responses}
		rargs = formatRequest(endpoint, token, data)
		requests.post(**rargs)

	def _guess(self, token):
		if len(self.opResponses) == 0:
			raise Exception("Cannot guess until responses are received.")

		endpoint = os.path.join(self.gameUrl, 'guess')
		data = {'guess': self.guessFn(self.opResponses)}
		rargs = formatRequest(endpoint, token, data)
		requests.post(**rargs)

	def _updateOpQuestions(self, opQuestions):
		if len(self.opQuestions) > 0:
			printv("Warning: Rejected attempt to update opponent questions after they were set.", 2)
			return

		opQuestions = sorted(opQuestions, key=lambda q: int(q['questionNum']))
		self.opQuestions = [str(q['question']['question']) for q in opQuestions]

	def _updateOpResponses(self, opResponses):
		if len(self.opResponses) > 0:
			printv("Warning: Rejected attempt to update opponent responses after they were set.", 2)
			return
		
		opResponses = sorted(opResponses, key=lambda r: int(r['questionNum']))
		self.opResponses = [str(r['response']['response']) for r in opResponses]

	def _updateOpGuess(self, opGuess):
		if self.opGuess > 0:
			printv("Warning: Rejected attempt to update opponent guess after it was set.", 2)
			return
		
		self.opGuess = opGuess

	def _updateOutcome(self, outcome):
		if self.outcome is not None:
			printv("Warning: Rejected attempt to update outcome after it was set.", 2)
			return
		
		self.outcome = outcome

	def updateGame(self, gameJson, token):
		newPhase = gameJson['phase']

		if gameJson['active'] and (newPhase == self.phase):
			printv("No updates to game "+self.gameId, 2)
			return False

		# update data
		self._updateOpQuestions(gameJson['opQuestions'])
		self._updateOpResponses(gameJson['opResponses'])
		self._updateOpGuess(gameJson['opGuess'])
		self._updateOutcome(gameJson['outcome'])

		# update phase and turn
		self.phase = newPhase
		self.active = gameJson['active']
		self.turn = gameJson['turn']

		if not self.active:
			print "check1"
			return False

		if self.turn:
			if self.phase < 2:
				printv("Interviewing.")
				self._interview(token)
				return False
			elif self.phase < 4:
				printv("Responding.")
				self._respond(token)
				return False
			elif self.phase < 6:
				printv("Guessing.")
				self._guess(token)
				return False
			else:
				printv("Game complete.")
				return True
		else:
			printv("Waiting.")

		return True



	def getOutcome(self):
		if self.outcome is None:
			raise Exception("Game is not finished")

		return self.outcome


# LunaPlayer
class LunaPlayer(object):
	def __init__(self, token, responseFn, guessFn):
		self.token = token
		self.responseFn = responseFn
		self.guessFn = guessFn
		self.games = {} # gameIds to LunaGames
		self.numGames = 0
		self.numWins = 0
		self.smartsRating = None
		self.interviewQuestions = []
		self.finishedGames = []

	def setInterviewQuestions(self, interviewQuestions):
		if len(interviewQuestions) != 5:
			raise Exception("You must provide 5 interview questions.")
		self.interviewQuestions = interviewQuestions

	def createGame(self):
		if len(self.interviewQuestions) != 5:
			raise Exception("You must first set interview questions.")
		endpoint = 'home'
		rargs = formatRequest(endpoint, self.token, {})
		newGame = json.loads(requests.post(**rargs).content)
		if newGame:
			newLunaGame =  self._lunaGameFromResponse(newGame, self.interviewQuestions)
			self.games[newGame['_id']] = newLunaGame
			return True
		else:
			print "Warning: Maximum active game number exceeded."
			return False

	def _lunaGameFromResponse(self, resp, interviewQuestions):
		if len(interviewQuestions) != 5:
			raise Exception("You must provide 5 interview questions.")
		return LunaGame(resp['_id'], resp['phase'], resp['turn'], self.interviewQuestions, self.responseFn, self.guessFn)

	def _loadGame(self, gameJson):
		if len(gameJson['questions'])>0:
			lgame = self._lunaGameFromResponse(gameJson, gameJson['questions'])
		else:
			lgame = self._lunaGameFromResponse(gameJson, self.interviewQuestions)
		self.games[gameJson['_id']] = lgame

	def _finishGame(self, gameJson):
		if gameJson in self.finishedGames:
			return False
		self.finishedGames.append(gameJson)
		return True

	def _updateAllGames(self):
		endpoint = 'home'
		rargs = formatRequest(endpoint, self.token)
		games = json.loads(requests.get(**rargs).content)
		significantUpdate = False
		for game in games:
			if game['active']:
				try:
					savedGame = self.games[game['_id']]
					if savedGame.updateGame(game, self.token):
						significantUpdate = True
				except KeyError:
					printv("Loading game "+game['_id'])
					self._loadGame(game)
			else:
				if self._finishGame(game):
					significantUpdate = True

		if significantUpdate:
			self.report()
		return significantUpdate

	def _updateStats(self):
		endpoint = 'profile'
		rargs = formatRequest(endpoint, self.token)
		playerJson = json.loads(requests.get(**rargs).content)
		self.numGames = playerJson['player']['numGames']
		self.numWins = playerJson['player']['numWins']
		self.smartsRating = playerJson['player']['smartsRating']

	def report(self):
		print "Total games:",
		print self.numGames
		print "Total wins:",
		print self.numWins
		print "Smarts Rating:",
		print self.smartsRating

	def update(self):
		self._updateStats()
		return self._updateAllGames()





