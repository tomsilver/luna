import json
import os
import requests


# Constants
BASE_URL = 'http://localhost:3000/'
VERBOSITY = 1

# Utilities
def printv(s, v=VERBOSITY):
	if v:
		print s

def formatRequest(endpoint, token, data=None, baseUrl=BASE_URL):
	url = 'http://localhost:3000/'+endpoint
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
			print "Warning: Rejected attempt to update opponent questions after they were set."
			return
		
		self.opQuestions = opQuestions

	def _updateOpResponses(self, opResponses):
		if len(self.opResponses) > 0:
			print "Warning: Rejected attempt to update opponent responses after they were set."
			return
		
		self.opResponses = opResponses

	def _updateOpGuess(self, opGuess):
		if self.opGuess > 0:
			print "Warning: Rejected attempt to update opponent guess after it was set."
			return
		
		self.opGuess = opGuess

	def _updateOutcome(self, outcome):
		if self.outcome is not None:
			print "Warning: Rejected attempt to update outcome after it was set."
			return
		
		self.outcome = outcome

	def updateGame(self, gameJson, token):
		newPhase = gameJson['phase']

		if newPhase == self.phase:
			printv ("No updates to game "+self.gameId)
			return

		if (newPhase < self.phase) or (newPhase - self.phase > 2):
			raise Exception("Game "+self.gameId+" is out of sync with server.")

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

	def createGame(self, interviewQuestions):
		endpoint = 'home'
		rargs = formatRequest(endpoint, self.token, {})
		newGame = json.loads(requests.post(**rargs).content)
		newLunaGame =  LunaGame(newGame['_id'], newGame['phase'], newGame['turn'], interviewQuestions, self.responseFn, self.guessFn)
		self.games[newGame['_id']] = newLunaGame

	def _updateAllGames(self):
		endpoint = 'home'
		rargs = formatRequest(endpoint, self.token)
		games = json.loads(requests.get(**rargs).content)
		for game in games:
			try:
				savedGame = self.games[game['_id']]
				savedGame.updateGame(game, self.token)
			except KeyError:
				raise Exception("Game "+game['_id']+" from server is unrecognized by player.")

	def _updateStats(self):
		TODO

	def report(self):
		TODO

	def update(self):
		self._updateAllGames()
		self._updateStats()






