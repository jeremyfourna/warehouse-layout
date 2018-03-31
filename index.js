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
    return R.ifElse(
      cur => notEmpty(R.prop('value', cur)),
      cur => ({
        [R.prop('id', cur)]: R.prop('value', cur)
      }),
      R.always({})
    )(cur);
  }, formData));

  return buildWarehouse(data);
}

function buildWarehouse(params) {
  const warehouse = warehouseMatrix(Number(R.prop('nb-racks', params)), Number(R.prop('nb-aisles', params)), []);
  const rows = wrapRow(R.map(buildRow, warehouse));

  return render('app', rows);
}

function wrapRow(rows) {
  return `<div class="warehouse">${R.join('', rows)}</div>`;
}

function buildRow(list) {
  function typeOfPlace(place) {
    return R.ifElse(
      R.equals(0),
      R.always('<div class="place"></div>'),
      R.always('<div class="place wall"></div>')
    )(place);
  }

  return `<div class="row">${R.join('', R.map(typeOfPlace, list))}</div>`;
}

function render(domId, content) {
  const el = document.getElementById(domId);
  el.innerHTML = content;

  return el;
}
