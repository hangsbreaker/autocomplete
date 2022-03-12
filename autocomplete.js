function autocomplete(inpt, arr, inptres = null) {
  var inp = document.getElementById(inpt);
  inp.setAttribute("autocomplete", "off");
  if (inptres != null) {
    var inpres = document.getElementById(inptres);
  }
  inp.insertAdjacentHTML(
    "afterEnd",
    '<div id="wrapauto-' + inpt + '" class="wrapautocomplete"></div>'
  );

  var wrapauto = document.getElementById("wrapauto-" + inpt);

  var currentFocus;
  var ncofus = 0;
  inp.addEventListener("input", function (e) {
    let me = this;
    if ("type" in arr && "url" in arr) {
      getfromsrv(me, arr);
    } else {
      loadinput(this, arr);
    }
  });
  inp.addEventListener("click", function (e) {
    let me = this;
    if ("type" in arr && "url" in arr) {
      getfromsrv(me, arr);
    } else {
      loadinput(this, arr);
    }
  });
  inp.addEventListener("keydown", function (e) {
    var x = document.getElementById(this.id + "autocomplete-list");
    var dvl = x;
    if (x) x = x.getElementsByTagName("div");
    if (e.keyCode == 40) {
      currentFocus++;
      addActive(x);

      if (currentFocus > 7) {
        ncofus = currentFocus;
        dvl.scrollTop = 35 * (currentFocus - 7);
      }
      if (currentFocus == 0) {
        ncofus = currentFocus;
        dvl.scrollTop = 0;
      }
    } else if (e.keyCode == 38) {
      currentFocus--;
      addActive(x);

      if (currentFocus < ncofus - 7) {
        dvl.scrollTop = 35 * (ncofus - 7) - 35;
        ncofus = ncofus - 1;
      }
      if (currentFocus == arr.length - 1) {
        ncofus = currentFocus;
        dvl.scrollTop = 35 * (arr.length - 1);
      }
    } else if (e.keyCode == 13) {
      e.preventDefault();
      if (currentFocus > -1) {
        if (x) x[currentFocus].click();
      }
    }
  });
  function getfromsrv(me, arr) {
    let type = arr.type.toLowerCase();
    let url = type == "get" ? arr.url + "?keyword=" + me.value : arr.url;
    wrapauto.innerHTML = '<div class="autoloading">Loading...</div>';

    var http = new XMLHttpRequest();
    http.open(type, url, true);
    http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    http.onreadystatechange = function () {
      if (http.readyState == 4 && http.status === 200) {
        let data = JSON.parse(http.responseText);
        loadinput(me, data);
      }
    };
    http.send("keyword=" + me.value);
  }
  function addActive(x) {
    if (!x) return false;
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = x.length - 1;
    x[currentFocus].classList.add("autocomplete-active");
  }
  function removeActive(x) {
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }
  function closeAllLists(elmnt) {
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
    wrapauto.innerHTML = "";
  }
  function loadinput(me, arr) {
    let a,
      b,
      i,
      val = me.value;
    closeAllLists();
    currentFocus = -1;
    a = document.createElement("DIV");
    a.setAttribute("id", me.id + "autocomplete-list");
    a.setAttribute("class", "autocomplete-items");
    wrapauto.appendChild(a);
    for (i = 0; i < arr.length; i++) {
      if (arr[i][1] !== undefined) {
        let key = val.toLowerCase();
        let text = arr[i][1].toLowerCase();
        let fnd = text.indexOf(key);
        let t = arr[i][1].substr(fnd, key.length);
        let words =
          arr[i][1].substr(0, fnd) +
          "<strong>" +
          t +
          "</strong>" +
          arr[i][1].substr(fnd + key.length, arr[i][1].length);

        if (t.toLowerCase() == key) {
          b = document.createElement("DIV");
          b.innerHTML = words;
          b.innerHTML += "<input type='hidden' value='" + arr[i][0] + "'>";
          b.innerHTML += "<input type='hidden' value='" + arr[i][1] + "'>";
          b.addEventListener("click", function (e) {
            inp.value = this.getElementsByTagName("input")[1].value;
            if (inpres != null) {
              inpres.value = this.getElementsByTagName("input")[0].value;
            }
            closeAllLists();
          });
          a.appendChild(b);
        }
      }
    }
  }
  document.addEventListener("click", function (e) {
    closeAllLists(e.target);
  });
}
