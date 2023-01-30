export default (keyboard) => {
  const keyboardNew = [];

  keyboard.forEach(_keyboard => {
    keyboardNew.push([{text:_keyboard}]);
  });

  return keyboardNew;
}

// export default (keyboard) => {
//   const keyboardNew = [];

//   keyboard.map(item => {
//     const _item = {
//       text: item.buttonName
//     }

//     _item.callback_data = item.payload ? { title: item.buttonName, type:'quickReplies', ...item.payload } : { title: item.buttonName, type:'quickReplies'}
//     _item.callback_data = JSON.stringify(_item.payload);
    
//     return _item
//   });
//   console.log(JSON.stringify(keyboard));
//   keyboard.forEach(element => {
//     keyboardNew.push([element]);
//   });
//   console.log(keyboardNew);

//   return keyboardNew;
// }