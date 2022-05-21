import random


def randomize(arr: list):
    length: int = len(arr)
    for a in range(length * 5):
        for i in range(length):
            x = random.randrange(0, length)
            y = random.randrange(0, length)
            arr[x], arr[y] = arr[y], arr[x]
