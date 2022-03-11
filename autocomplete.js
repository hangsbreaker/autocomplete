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

  /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
  var currentFocus;
  var ncofus = 0;
  /*execute a function when someone writes in the text field:*/
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
  /*execute a function presses a key on the keyboard:*/
  inp.addEventListener("keydown", function (e) {
    var x = document.getElementById(this.id + "autocomplete-list");
    var dvl = x;
    if (x) x = x.getElementsByTagName("div");
    if (e.keyCode == 40) {
      /*If the arrow DOWN key is pressed,
            increase the currentFocus variable:*/
      currentFocus++;
      /*and and make the current item more visible:*/
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
      //up
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
    $.ajax({
      type: type,
      url: url,
      data: "keyword=" + me.value,
      beforeSend: function () {
        wrapauto.innerHTML = '<div class="autoloading">Loading</div>';
      },
      success: function (data) {
        data = JSON.parse(data);
        loadinput(me, data);
      },
    });
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
    /*close any already open lists of autocompleted values*/
    closeAllLists();
    //if (!val) { return false;}
    currentFocus = -1;
    /*create a DIV element that will contain the items (values):*/
    a = document.createElement("DIV");
    a.setAttribute("id", me.id + "autocomplete-list");
    a.setAttribute("class", "autocomplete-items");
    /*append the DIV element as a child of the autocomplete container:*/
    wrapauto.appendChild(a);
    /*for each item in the array...*/
    for (i = 0; i < arr.length; i++) {
      /*check if the item starts with the same letters as the text field value:*/
      if (arr[i][1] !== undefined) {
        let key = val.toLowerCase();
        let text = arr[i][1].toLowerCase();
        let fnd = text.indexOf(key);
        let ft = arr[i][1].substr(0, fnd);
        let tt = "<strong>" + arr[i][1].substr(fnd, key.length) + "</strong>";
        let lt = arr[i][1].substr(fnd + key.length, arr[i][1].length);
        let words = ft + tt + lt;

        /*create a DIV element for each matching element:*/
        b = document.createElement("DIV");
        /*make the matching letters bold:*/
        b.innerHTML = words;
        /*insert a input field that will hold the current array item's value:*/
        b.innerHTML += "<input type='hidden' value='" + arr[i][0] + "'>";
        b.innerHTML += "<input type='hidden' value='" + arr[i][1] + "'>";
        /*execute a function when someone clicks on the item value (DIV element):*/
        b.addEventListener("click", function (e) {
          /*insert the value for the autocomplete text field:*/
          inp.value = this.getElementsByTagName("input")[1].value;
          if (inpres != null) {
            inpres.value = this.getElementsByTagName("input")[0].value;
          }
          /*close the list of autocompleted values,
                    (or any other open lists of autocompleted values:*/
          closeAllLists();
        });
        a.appendChild(b);
      }
    }
  }
  document.addEventListener("click", function (e) {
    closeAllLists(e.target);
  });
}
