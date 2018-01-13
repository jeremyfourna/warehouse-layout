const R = require('ramda');

const notNil = R.complement(R.isNil);
const notEmpty = R.complement(R.isEmpty);

const {
  shortestClosestNeighbourPath,
  shortestSShapedPath,
  warehouseMatrix,
  shortestPathViaEllipse
} = require('warehouse-path');

const el = document.getElementById('display-picker-tour');
el.addEventListener('click', displayWarehouseAndPickerTour, false);

function displayWarehouseAndPickerTour(event) {
  const formLens = R.lensPath(['target', 'form']);
  const formData = R.view(formLens, event);

  const data = R.mergeAll(R.map(cur => {
    return notEmpty(R.prop('value', cur)) ? {
      [R.prop('id', cur)]: R.prop('value', cur)
    } : {};
  }, formData));

  console.log(data);
  buildWarehouse(data);
}

function buildWarehouse(params) {
  const warehouse = warehouseMatrix(Number(R.prop('nb-racks', params)), Number(R.prop('nb-aisles', params)), []);
  console.log(warehouse);

  const rows = wrapRow(R.map(buildRow, warehouse));

  render('app', rows);
}

function wrapRow(rows) {
  return `<div class="warehouse">${R.join('', rows)}</div>`;
}

function buildRow(list) {
  function typeOfPlace(place) {
    return R.equals(place, 0) ? `<div class="place"></div>` : `<div class="place wall"></div>`;
  }

  return `<div class="row">${R.join('', R.map(typeOfPlace, list))}</div>`;
}

function render(domId, content) {
  const el = document.getElementById(domId).innerHTML = content;
  return el;
}
