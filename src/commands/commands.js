Office.onReady(() => {
  // Register any add-in commands here
});

function openTaskpane(event) {
  Office.addin.showAsTaskpane();
  event.completed();
}

globalThis.openTaskpane = openTaskpane;
