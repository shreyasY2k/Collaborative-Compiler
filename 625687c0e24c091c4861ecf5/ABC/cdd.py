a = int(input("Enter first number:"))
b = int(input("Enter second number:"))
sum = a+b
print(sum)

def binary_search(arr, item):
	first = 0
	last = len(arr) - 1
	while(first <= last):
		mid = (first + last) // 2
		if arr[mid] == item :
			return True
		elif item < arr[mid]:
			last = mid - 1
		else:
			first = mid + 1	
	return False 

def selection(s):
    for i in range(0,len(s)-1):
        p=0
        mini=s[-1]
        for j in range(i,len(s)):
            if s[j]<=mini:
                mini=s[j]
                p=j
        s[i],s[p]=s[p],s[i]
print(s)
selection([2,3,4,2,1,1,1,2])

def bubbleSort(lis):
    length = len(lis)
    for i in range(length):
        for j in range(length - i):
            a = lis[j]
            if a != lis[-1]:
                b = lis[j + 1]
                if a > b:
                    lis[j] = b
                    lis[j + 1] = a
    return lis

//