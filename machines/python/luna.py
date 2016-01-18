import json
import os
import requests


# Constants
BASE_URL = 'http://ec2-52-23-169-221.compute-1.amazonaws.com:3000/'
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
			printv("No updates to game "+self.gameId)
			return

		# update data
		self._updateOpQuestions(gameJson['opQuestions'])
		self._updateOpResponses(gameJson['opResponses'])
		self._updateOpGuess(gameJson['opGuess'])
		self._updateOutcome(gameJson['outcome'])

		# update phase and turn
		self.phase = newPhase
		self.turn = gameJson['turn']

		if self.turn:
			if self.phase < 2:
				printv("Interviewing.")
				self._interview(token)
			elif self.phase < 4:
				printv("Responding.")
				self._respond(token)
			elif self.phase < 6:
				printv("Guessing.")
				self._guess(token)
			else:
				printv("Game complete.")
		else:
			printv("Waiting.")



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


	def _lunaGameFromResponse(self, resp, interviewQuestions=None):
		if interviewQuestions is None:
			interviewQuestions = resp['questions']
		if len(interviewQuestions) != 5:
			raise Exception("You must provide 5 interview questions.")
		return LunaGame(resp['_id'], resp['phase'], resp['turn'], interviewQuestions, self.responseFn, self.guessFn)

	def createGame(self, interviewQuestions):
		if len(interviewQuestions) != 5:
			raise Exception("You must provide 5 interview questions.")
		endpoint = 'home'
		rargs = formatRequest(endpoint, self.token, {})
		newGame = json.loads(requests.post(**rargs).content)
		newLunaGame =  self._lunaGameFromResponse(newGame, interviewQuestions)
		self.games[newGame['_id']] = newLunaGame

	def _updateAllGames(self):
		endpoint = 'home'
		rargs = formatRequest(endpoint, self.token)
		games = json.loads(requests.get(**rargs).content)
		for game in games:
			# ignore old games
			if game['active']:
				try:
					savedGame = self.games[game['_id']]
					savedGame.updateGame(game, self.token)
				except KeyError:
					printv("Loading game "+game['_id'])
					lgame = self._lunaGameFromResponse(game)
					self.games[game['_id']] = lgame

	def _updateStats(self):
		pass

	def report(self):
		pass

	def update(self):
		self._updateAllGames()
		self._updateStats()






