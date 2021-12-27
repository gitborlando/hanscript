let arr = [1, 5, 6, 8, 4, 3, 9, 2]

const jh = (a, b) => {
  ;[a, b] = [b, a]
}

function 快速排序() {
  for (let a = 0; a < arr.length; a++) {
    for (let b = a; b < arr.length; b++) {
      if (arr[a] > arr[b]) {
        ;[arr[a], arr[b]] = [arr[b], arr[a]]
      }
    }
  }
  console.log(arr)
}

快速排序()
