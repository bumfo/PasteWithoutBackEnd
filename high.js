(function() {
  var c = document.querySelector("code");

  var C = document.querySelector("#c");

  window.addEventListener('DOMContentLoaded', e => {
    c.contentEditable = true;
    c.spellcheck = false;
    c.focus();
  });

  C.addEventListener('change', function f({callee}) {
    if (callee === update) {
      // console.log('break editor');
      return;
    }

    update(C.value, false, false, true, true);
  });

  // document.addEventListener("DOMContentLoaded", function() {
  //   update(document.querySelector("script").innerHTML);

  //   c.contentEditable = true;
  //   c.spellcheck = false;
  // });

  c.addEventListener("input", function() {
    var t = getCaret(c);

    update(c.textContent);
    setCaret(t, c);
  });

  function getCaretLine(lines, t) {
    var start = t[0], end = t[1],
      startLine = -1, endLine = -1,
      lineStart, lineEnd;

    var pj;
    for (var i = 0, j = 0, n = lines.length; i < n; ++i) {
      pj = j;
      j += lines[i].length + 1;

      if (startLine === -1 && j > start) {
        lineStart = pj;
        startLine = i;
      }

      if (endLine === -1 && j > end) {
        lineEnd = j - 1;
        endLine = i;
      }

      if (j > start && j > end)
        break;
    }

    return [startLine, endLine, lineStart, lineEnd];
  }

  function previousLineTabs(lines, startLine) {
    return startLine > 0 ? lines[startLine - 1].match(/^\t*/)[0].length : 0;
  }

  function tabsInsert(value, t, minTabs) {
    var start = t[0], end = t[1];

    var lines = value.split("\n");

    var caretLine = getCaretLine(lines, t),
      startLine = caretLine[0], endLine = caretLine[1],
      lineStart = caretLine[2], lineEnd = caretLine[3];

    var offset = 0;

    if (endLine > startLine) {
      offset = endLine - startLine + 1;
      var insertion = "\t" + lines.slice(startLine, endLine + 1).join("\n\t");

      value = value.substring(0, lineStart) + insertion + value.substring(lineEnd);

      t[0] = start + 1;
      t[1] = end + offset;
    } else {
      if (lineStart === start) {
        offset = previousLineTabs(lines, startLine);
      }

      offset = Math.max(minTabs === void(0) ? 1: minTabs, offset);

      console.log(offset, t.slice());

      value = value.substring(0, start) + new Array(offset + 1).join("\t") + value.substring(end);

      t[0] = t[1] = start + offset;
    }

    return value;
  }

  function tabsRemove() {

  }

  function positCaret(x, y) {
    var actualWidth = window.innerWidth, actualHeight = window.innerHeight;
  
    var r;

    x = Math.max(x, 0);
    x = Math.min(x, actualWidth - 1);
    y = Math.max(y, 0);
    y = Math.min(y, actualHeight - 1);

    var offsetNode, offset;

    if (document.caretPositionFromPoint) {
      r = document.caretPositionFromPoint(x, y);

      console.log(r);

      offsetNode = r.offsetNode;
      offset = r.offset;
    } else {
      r = document.caretRangeFromPoint(x, y);

      offsetNode = r.startContainer;
      offset = r.startOffset;
    }
    
    if (r) {
      return Caret.get(offsetNode, offset, c);
    }
  }

  c.addEventListener("keydown", function(e) {
    var keyCode = e.keyCode || e.which;

    if (keyCode === 9) {
      e.preventDefault();

      var t = getCaret(c);
      update(tabsInsert(c.textContent, t));
      setCaret(t, c);
    } else if (keyCode === 13) {
      e.preventDefault();

      var t = getCaret(c);
      var start = t[0], end = t[1];
      var value = c.textContent;
      value = value.substring(0, start) + "\n" + value.substring(end);
      t[1] = t[0] = start + 1;
      update(tabsInsert(value, t, 0));
      setCaret(t, c);
    }
  });

  c.addEventListener("paste", function(e) {
    e.preventDefault();

    var t = getCaret(c);
    var s = e.clipboardData.getData("text/plain");

    var start = t[0], end = t[1];
    var value = c.textContent;

    t[1] = t[0] = t[0] + s.length;

    update(value.substring(0, start) + s + value.substring(end));

    setCaret(t, c);
  });

  var tt = false;

  c.addEventListener("dblclick", function(e) {
    e.preventDefault();

    var value = c.textContent;

    var s = window.getSelection();

    var d = ['forward', 'backward'];

    var endNode = s.focusNode, endOffset = s.focusOffset;
    
    s.collapse(s.anchorNode, s.anchorOffset);

    s.modify("move", d[1], "character");
    s.extend(endNode, endOffset);
    s.modify("extend", d[0], "character");

    var t = getCaret(c);

    // console.log(t);

    var w = /\w/, o = /[\t=+\-*\/!()\[\]\{\},:;]/;

    var ss = [value[t[1] - 1], value[t[0]]];

    if (w.test(ss[0])) {
      s.modify("move", d[0], "character");
      s.modify("move", d[1], "word");

      s.extend(endNode, endOffset);
      s.modify("extend", d[0], "word");
    } else if (w.test(ss[1])) {
      s.modify("move", d[1], "character");
      s.modify("move", d[0], "word");

      s.extend(endNode, endOffset);
      s.modify("extend", d[1], "word");
    } else {
      var o0 = o.test(ss[0]), o1 = o.test(ss[1]);
      if (o1)
        s.modify("move", d[1], "character");

      while (o1) {
        if (o.test(value[t[0]-1])) {
          s.modify("move", d[1], "character");
          --t[0];
        } else
          o1 = false;
      } 

      s.extend(endNode, endOffset);
      s.modify("extend", d[0], "character");

      while (o0) {
        if (o.test(value[t[1]])) {
          s.modify("extend", d[0], "character");
          ++t[1];
        } else
          o0 = false;
      } 
    }
  });

  c.addEventListener("mousedown", function(e) {
    if (e.button === 0) {
      e.preventDefault();

      var t = [];

      t[0] = t[1] = positCaret(e.clientX, e.clientY);

      setCaret(t, c, true);

      tt = t;
    }
  });

  window.addEventListener("mousemove", function(e) {
    if (tt) {
      e.preventDefault();

      var t = [];

      t[0] = t[1] = positCaret(e.clientX, e.clientY);

      if (!isNaN(t[0])) {
        t[0] = Math.min(tt[0], t[0]);
        t[1] = Math.max(tt[1], t[1]);

        setCaret(t, c, true);
      }
    }


    // tt = t;
  });

  window.addEventListener("mouseup", function(e) {
    e.preventDefault();

    tt = false;
  });

  function encode(x) {
    return x.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  }

  var undoStack = [];

  function pushUndo(x) {
    if (undoStack.length > 1024) {
      undoStack = undoStack.slice(-1024);
    }

    undoStack.push(x);
  }

  function popUndo() {
    if (undoStack.length === 0) {
      return null;
    }
    return undoStack.pop();
  }

  var redoStack = [];

  function pushRedo(x) {
    if (redoStack.length > 1024) {
      redoStack = redoStack.slice(-1024);
    }

    redoStack.push(x);
  }

  function popRedo() {
    if (redoStack.length === 0) {
      return null;
    }
    return redoStack.pop();
  }

  function clearRedo() {
    redoStack.length = 0;
  }

  function undo() {
    // console.log(undoStack);

    var x = popUndo();

    // console.log(x);

    // console.log(undoStack);

    if (x !== null) {
      var t = x[1];
      
      update(x[0], true, false);

      setCaret(t, c);
    }
  }

  function redo() {
    var x = popRedo();
    if (x !== null) {
      var t = x[1];

      update(x[0], false, true);

      setCaret(t, c);
    }
  }

  window.addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey) {
      if (e.code === 'KeyZ') {
        if (e.shiftKey) {
          e.preventDefault();
          redo();
        } else {
          e.preventDefault();
          undo();
        }
      } else if (e.code === 'KeyS') {
        e.preventDefault();
      }
    }
  });

  var lastContent = '';
  var lastCaret = [0, 0];

  function throttle(callback, limit) {
    var wait = false;
    var call = true;
    return function () {
      if (!wait) {
        callback.apply(null, arguments);
        wait = true;
        setTimeout(function f() {
          if (call) {
            call = false;
            callback.apply(null, arguments);
            setTimeout(f, limit);
          } else {
            wait = false;
          }
        }, limit);
      } else {
        call = true;
      }
    }
  }

  var fireUpdated = throttle(function () {
    var event = new Event('change');
    event.callee = update;

    C.dispatchEvent(event);
  }, 100);

  function update(x, undo, redo, init, noFire) {
    // console.log(x.substr(0, 10), undo, redo);

    if (!x.endsWith('\n')) {
      x += '\n';
    }

    if (!init) {
      var pair = [lastContent, lastCaret];

      if (!undo && !redo) {
        pushUndo(pair);
        clearRedo();
      } else if (redo) {
        pushUndo(pair);
      } else if (undo) {
        pushRedo(pair);
      }

      C.value = x;
    }

    lastContent = x;
    lastCaret = getCaret(c);

    c.innerHTML = light(encode(x));

    if (!noFire) {
      fireUpdated();
    }
  }

  var Caret = function() {
    function some(a, f, u) {
      if (u === void(0)) u = false;
      for (var i = 0, n = a.length, r; i < n; ++i) if ((r = f(a[i], i, n)) !== u) return r;
      return u;
    }

    function getOffset(c, co, cc) {
      var cto = co, cp;
      if (c.nodeType !== 3) co = 0, some(c.childNodes, function(x, i) {
        if (i === cto) return true;
        co += x.textContent.length;
        return false;
      });
      return c === cc || cc && !cc.contains(c) ? co : function get(c, co, cc) {
        var cp = c.parentNode;
        if (c !== cp.firstChild) some(cp.childNodes, function(x) {
          if (x === c) return true;
          co += x.textContent.length;
          return false;
        });
        return cc && cc !== cp && cc.contains(cp) ? get(cp, co, cc) : co;
      }(c, co, cc);
    }

    function setOffset(cc, co, set, tion) {
      var to = co, c = cc;
      some(cc.childNodes, function(x, i, n) {
        var l = x.textContent.length; c = x;
        if (tion) {
          if (to < l) return true;
          if (to !== l || i !== n - 1) to -= l;
        } else {
          if (to <= l) return true;
          to -= l;
        }
        return false;
      });
      return c === cc || c.nodeType === 3 ? (set(c, to), c) : c = setOffset(c, to, set, tion);
    }

    return { get: getOffset, set: setOffset };
  }();

  function getCaret(x) {
    var s = window.getSelection();
    if (s.rangeCount > 0) {
      var r = s.getRangeAt(0);

      return (x.contains(r.startContainer)) ? 
        [Caret.get(r.startContainer, r.startOffset, x), Caret.get(r.endContainer, r.endOffset, x)] : [0, 0];
    } else {
      return [0, 0];
    }
  }

  function setCaret(ro, y, user) {
    var s = window.getSelection(), r;

    if (ro) {
      lastCaret = ro;

      if (document.activeElement !== c)
        c.focus();

      s.removeAllRanges();

      r = document.createRange();

      Caret.set(y, ro[0], r.setStart.bind(r));
      
      if (ro[0] === ro[1])
        r.collapse(true);
      else
        Caret.set(y, ro[1], r.setEnd.bind(r));

      s.addRange(r);

      if (!user)
        tt = false;
    }
  }
}());
