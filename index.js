const R = require('ramda');

const {
  shortestClosestNeighbourPath,
  shortestSShapedPath,
  warehouseMatrix,
  shortestPathViaEllipse
} = require('warehouse-path');

const el = document.getElementById('display-picker-tour');
el.addEventListener('click', displayWarehouseAndPickerTour, false);

function displayWarehouseAndPickerTour(event) {
  console.log(event);
}
