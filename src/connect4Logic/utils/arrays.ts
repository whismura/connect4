
// calculate minimum, or return null if all are null
export function arrayMin(array:any[]){
  // if(array.length===0){
  //   console.error("array empty");
  // }
  let lowest = null;
  for(const e of array){
    if(e===null){
      continue;
    }
    if(lowest===null){
      lowest = e;
    }
    else if(e<lowest){
      lowest = e;
    }
  }
  return lowest;
}

// calculate maximum, or return null if all are null
export function arrayMax(array:any[]){
  // if(array.length===0){
  //   console.error("array empty");
  // }
  let highest = null;
  for(const e of array){
    if(e===null){
      continue;
    }
    if(highest===null){
      highest = e;
    } else if(e>highest){
      highest = e;
    }
  }
  return highest;
}

// calculate the number of a particular element appears in an array
export function numOfThatElementIn(array:any[],element:any){
  let counter = 0;
  for(const e of array){
    if(e===element){
      counter++;
    }
  }
  return counter;
}

// return those indices where array[index] === element
export function indicesOf(array:any[],element:any){
  const resultArray = [];
  for(let i=0;i<array.length;i++){
    if(array[i]===element){
      resultArray.push(i);
    }
  }
  return resultArray;
}