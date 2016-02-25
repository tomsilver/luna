from luna import LunaPlayer
from html2text import html2text

import csv
import os
import requests
import time

dummyQuestions = ['What color is the sky?', 'What is the direct object in this sentence: "The boy threw the ball to the dog"?', "Why is 6 afraid of 7?", "Why does poverty exist?", "What is the capital of New York?"]
dummyAnswers = ['blue', 'ball', '7 8 9', 'poverty', 'albany']

print "Loaded start_csail bot"

def loadToken(tokenName, tokenDir='../tokens'):
	tokenFile = os.path.join(tokenDir, tokenName)
	with open(tokenFile, 'rb') as f:
		reader = csv.reader(f)
		for row in reader:
			return row[0]

def myResponseFunction(question):
	time.sleep(1)
	r = requests.get("http://start.csail.mit.edu/justanswer.php", params={'query': question})
	s = r.text
	idx1 = s.rfind("<!-- REPLY-QUALITY: T -->")
	idx2 = s[idx1:].find("<P>")
	start = idx1+idx2+len("<P>")
	idx3 = s[start:].find("</P>")
	if idx3 < 0:
		idx3 = s[start:].find("<P>")
	end = start + idx3
	answer = s[start:end]
	return html2text(answer)
	

def myGuessFunction(responses):
	guess = 0
	for i,response in enumerate(responses):
		if dummyAnswers[i] in str(response).lower():
			guess += 20
	return guess

def startNewGame(player):
	if player.createGame():
		print "Starting game",
		print player.games.keys()[0]


if __name__ == '__main__':
	myToken = loadToken('machine3.csv')
	myPlayer = LunaPlayer(myToken, myResponseFunction, myGuessFunction)
	myPlayer.setInterviewQuestions(dummyQuestions)
	startNewGame(myPlayer)

	while True:
		if myPlayer.update():
			pass
			# startNewGame(myPlayer)
		time.sleep(10)






