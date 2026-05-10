/* 種まき支援AR — 画面遷移制御
   選択値はすべて URL クエリで次画面へ受け渡す。
   - planter.html → method.html?planter=size_S
   - method.html → ar.html?planter=size_S&method=row */
(function () {
  'use strict';

  function getParam(name) {
    return new URLSearchParams(location.search).get(name);
  }

  function buildUrl(path, params) {
    var qs = [];
    Object.keys(params).forEach(function (k) {
      if (params[k] != null && params[k] !== '') {
        qs.push(encodeURIComponent(k) + '=' + encodeURIComponent(params[k]));
      }
    });
    return qs.length ? path + '?' + qs.join('&') : path;
  }

  document.addEventListener('DOMContentLoaded', function () {
    var planter = getParam('planter');

    // method.html：「すじまき」「点まき」リンクに planter & method を付与
    var rowBtn = document.getElementById('row-btn');
    var pointBtn = document.getElementById('point-btn');
    if (rowBtn) rowBtn.href = buildUrl('ar.html', { planter: planter, method: 'row' });
    if (pointBtn) pointBtn.href = buildUrl('ar.html', { planter: planter, method: 'point' });
  });
})();
