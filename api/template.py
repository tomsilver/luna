from luna import LunaPlayer

import csv
import os
import time


def loadToken(tokenName, tokenDir='tokens'):
	tokenFile = os.path.join(tokenDir, tokenName)
	with open(tokenFile, 'rb') as f:
		reader = csv.reader(f)
		for row in reader:
			return row

def myResponseFunction(question):
	return "Fake response"

def myGuessFunction(responses):
	return 50

if __name__ == '__main__':
	myToken = loadToken('machine1.csv')
	myInterviewQuestions = ['Hi', 'How', 'Are', 'You', 'Today?']
	myPlayer = LunaPlayer(myToken, myResponseFunction, myGuessFunction)
	myPlayer.createGame(myInterviewQuestions)
	print myPlayer.games

	while True:
		myPlayer.update()
		time.sleep(10)






