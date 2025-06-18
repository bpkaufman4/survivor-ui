import apiUrl from "../apiUrls";

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
  for (const key in object) {
    if (!object[key]) object[key] = null;
  }
  return object;
}

export async function handleGet(url, setErrorFunction = null) {
  try {
    if (!url) {
      console.log(url);
      if (setErrorFunction) setErrorFunction(true);
      throw new Error("No url provided");
    }

    const call = await fetch(`${apiUrl + url}`, {
      headers: {
        "Authorization": localStorage.getItem('jwt')
      }
    })
      .then(response => response.json())
      .then(reply => {
        if (reply.status === 'fail') {
          throw new Error(reply.err || '');
        } else {
          return reply;
        }
      })

    return call;
  } catch (err) {
    console.log(err);
    if (setErrorFunction) setErrorFunction(true)
    return { status: 'fail', err };
  }

}

export async function handlePatch(url, body, setErrorFunction = null) {
  try {
    if (!body || !url) {
      console.log(body, url);
      if (setErrorFunction) setErrorFunction(true);
      throw new Error("Needs url and/or body")
    }

    
    if (typeof body !== 'string') body = JSON.stringify(body);
    console.log(body);

    const call = await fetch(`${apiUrl + url}`, {
      body,
      method: 'PATCH',
      headers: {
        "Content-Type": "application/json",
        "Authorization": localStorage.getItem('jwt')
      }
    })
      .then(response => response.json())
      .then(reply => {
        if (reply.status === 'fail') {
          throw new Error(reply.err || '');
        } else {
          return reply;
        }
      })

    return call;

  } catch (err) {
    console.log(err);
    if (setErrorFunction) setErrorFunction(true)
    return { status: 'fail', err };
  }
}

export async function handleDelete(url, setErrorFunction = null) {
  try {
    if (!url) {
      console.log(url);
      if (setErrorFunction) setErrorFunction(true);
      throw new Error("Needs url");

    }

    const call = await fetch(`${apiUrl + url}`, {
      method: 'DELETE',
      headers: {
        "Authorization": localStorage.getItem('jwt')
      }
    })
      .then(response => response.json())
      .then(reply => {
        if (reply.status === 'fail') {
          throw new Error(reply.err || '');
        } else {
          return reply;
        }
      })

    return call;

  } catch (err) {
    console.log(err);
    if (setErrorFunction) setErrorFunction(true)
    return { status: 'fail', err };
  }
}

export async function handlePost(url, body, setErrorFunction = null) {
  try {

    if (!url || !body) {
      console.log(body, url);
      if (setErrorFunction) setErrorFunction(true);
      throw new Error("Needs url");

    }

    if (typeof body !== 'string') body = JSON.stringify(body);

    const call = await fetch(`${apiUrl + url}`, {
      method: 'POST',
      body,
      headers: {
        "Content-Type": "Application/json",
        "Authorization": localStorage.getItem('jwt')
      }
    })
      .then(response => response.json())
      .then(reply => {
        if (reply.status === 'fail') {
          throw new Error(reply.err || '');
        } else {
          return reply;
        }
      })

    return call;

  } catch (err) {
    console.log(err);
    if (setErrorFunction) setErrorFunction(true)
    return { status: 'fail', err };
  }
}

export default { getElem, getValue, getFormValues, sanitizeFormValues, handlePost, handleGet, handleDelete, handlePatch };