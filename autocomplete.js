function autocomplete(inpt, params = {}) {
  params.minInput = "minInput" in params ? params.minInput : 0;
  params.target = "target" in params ? params.target : "";
  params.data = "data" in params ? params.data : [];
  params.url = "url" in params ? params.url : "";
  params.type = "type" in params ? params.type : "";
  params.multiple = "multiple" in params ? params.multiple : false;
  params.required = "required" in params ? params.required : false;

  var arr = params.data;
  var stsclick = false;
  var inp = document.getElementById(inpt);
  inp.setAttribute("autocomplete", "off");
  if (
    params.target != null &&
    params.target != "multiple" &&
    typeof params.target != "function"
  ) {
    var inpres = document.getElementById(params.target);
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
    if (params.type != "" && params.url != "") {
      getfromsrv(me, arr);
    } else {
      loadinput(me, arr);
    }
  });
  inp.addEventListener("click", function (e) {
    let me = this;
    if (params.type != "" && params.url != "") {
      getfromsrv(me, arr);
    } else {
      loadinput(me, arr);
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
    let type = params.type.toLowerCase();

    let val = me.value.trim();
    let comm = val.split(",");
    val = comm[comm.length - 1].trim();

    wrapauto.innerHTML = '<div class="autoloading">Loading...</div>';

    var http = new XMLHttpRequest();
    http.open(type, params.url, true);
    http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    http.onreadystatechange = function () {
      if (http.readyState == 4 && http.status === 200) {
        if (isJson(http.responseText)) {
          let data = JSON.parse(http.responseText);
          if (data != null) {
            if (data.length > 0) {
              loadinput(me, data);
            } else {
              wrapauto.innerHTML = "";
            }
          } else {
            wrapauto.innerHTML = "";
          }
        } else {
          console.log(http.responseText);
        }
      }
    };
    http.send("keyword=" + val);
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
    if (elmnt != inp) {
      wrapauto.innerHTML = "";
    }
  }
  function loadinput(me, arr) {
    let a,
      b,
      i,
      val = me.value.trim();
    stsclick = false;
    if (val.length >= params.minInput) {
      let comm = val.split(",");
      val = comm[comm.length - 1].trim();
      closeAllLists();
      currentFocus = -1;
      a = document.createElement("DIV");
      a.setAttribute("id", me.id + "autocomplete-list");
      a.setAttribute("class", "autocomplete-items");
      wrapauto.appendChild(a);
      let k,
        r = "";
      for (i = 0; i < arr.length; i++) {
        if (arr[i].length == 2) {
          k = arr[i][0];
          r = arr[i][1];
        } else {
          k = arr[i];
          r = arr[i];
        }
        let key = val.toLowerCase();
        let text = r.toLowerCase();
        let fnd = text.indexOf(key);
        let t = r.substr(fnd, key.length);
        let words =
          r.substr(0, fnd) +
          (t != "" ? "<strong>" + t + "</strong>" : "") +
          r.substr(fnd + key.length, r.length);

        if (t.toLowerCase() == key && text != key) {
          b = document.createElement("DIV");
          b.innerHTML = words;
          b.innerHTML += "<input type='hidden' value='" + k + "'>";
          b.innerHTML +=
            "<input type='hidden' value='" + htmlEntities(r) + "'>";
          b.addEventListener("click", function (e) {
            if (params.multiple) {
              inp.value =
                inp.value.substring(0, inp.value.length - val.length) +
                this.getElementsByTagName("input")[0].value +
                ", ";
            } else {
              inp.value = this.getElementsByTagName("input")[1].value;
              if (params.target != "" && typeof params.target != "function") {
                inpres.value = this.getElementsByTagName("input")[0].value;
              } else if (typeof params.target == "function") {
                let dts = [
                  this.getElementsByTagName("input")[0].value,
                  this.getElementsByTagName("input")[1].value,
                ];
                params.target(dts);
              } else {
                inp.value = this.getElementsByTagName("input")[0].value;
              }
            }
            stsclick = true;
            closeAllLists();
          });
          a.appendChild(b);
        }
      }
    }
  }
  function htmlEntities(rawStr) {
    var encodedStr = rawStr.replace(/[\u00A0-\u9999<>\&]/g, function (i) {
      return "&#" + i.charCodeAt(0) + ";";
    });
    return encodedStr;
  }
  function isJson(str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }
  document.addEventListener("click", function (e) {
    closeAllLists(e.target);
    if (params.required && !stsclick) {
      inp.value = "";
      if (params.target != "" && typeof params.target != "function") {
        inpres.value = "";
      }
    }
  });
}
