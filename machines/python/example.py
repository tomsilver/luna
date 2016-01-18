from luna import LunaPlayer

import cleverbot
import csv
import os
import time

dummyQuestions = ['What color is the sky?', 'What is the direct object in this sentence: "The boy threw the ball to the dog"?', "Why is 6 afraid of 7?", "Why does poverty exist?", "What is the capital of New York?"]
dummyAnswers = ['blue', 'ball', '7 8 9', 'poverty', 'albany']

CB = cleverbot.Cleverbot()
print "Loaded cleverbot"

def loadToken(tokenName, tokenDir='../tokens'):
	tokenFile = os.path.join(tokenDir, tokenName)
	with open(tokenFile, 'rb') as f:
		reader = csv.reader(f)
		for row in reader:
			return row[0]

def myResponseFunction(question):
	time.sleep(1)
	return CB.ask(question)

def myGuessFunction(responses):
	guess = 0
	for i,response in enumerate(responses):
		if dummyAnswers[i] in str(response).lower():
			guess += 20
	return guess

if __name__ == '__main__':
	myToken = loadToken('machine1.csv')
	myInterviewQuestions = dummyQuestions
	myPlayer = LunaPlayer(myToken, myResponseFunction, myGuessFunction)
	myPlayer.createGame(myInterviewQuestions)
	print "Starting game",
	print myPlayer.games.keys()[0]

	while True:
		myPlayer.update()
		time.sleep(10)






