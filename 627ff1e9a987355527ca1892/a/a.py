//binary search python.
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