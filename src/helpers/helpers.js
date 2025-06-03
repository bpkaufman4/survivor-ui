export function getElem(id) {
  return document.getElementById(id);
}

export function getValue(id) {
  return document.getElementById(id).value;
}

export function getFormValues(idArray) {
  let values = {};

  idArray.forEach(id => {
    values[id] = getValue(id)
  });

  return values;
}

export function sanitizeFormValues(object) {
  for(const key in object) {
    if(!object[key]) object[key] = null;
  }
  return object;
}

export default { getElem, getValue, getFormValues, sanitizeFormValues };