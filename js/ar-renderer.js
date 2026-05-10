/* 種まき支援AR — AR描画制御
   仕様書 §3.2.5 に基づき、マーカーを基準にプランター上面の3D座標系を構築し、
   算出された播種位置に円柱（直径8mm × 高さ5mm）を配置する。

   座標変換（cm → A-Frame m）:
     マーカーは「プランター長辺の手前中央、土の表面」に貼付し、
     マーカー上辺をプランター長辺と平行にする。
       ar_x = (planter_x - 長辺長/2) / 100   …長辺方向（マーカー右が +x）
       ar_y = 円柱高さ/2 + 微小オフセット      …マーカー面から少し上
       ar_z = -planter_y / 100               …プランター奥は -z 方向 */

(function () {
  'use strict';

  var PLANTER_NAMES = { size_S: 'ミニ', size_L: '標準' };
  var METHOD_NAMES = { row: 'すじまき', point: '点まき' };
  var COLOR_ROW = '#43A047';
  var COLOR_POINT = '#1565C0';
  var CYL_R = 0.004;     // 直径 8mm → 半径 4mm
  var CYL_H = 0.005;     // 高さ 5mm
  var Y_OFFSET = 0.0005; // 0.5mm 浮かせて Z-fighting 回避
  var OPACITY = 0.5;

  function getParam(name) {
    return new URLSearchParams(location.search).get(name);
  }

  function showStatus(text, found) {
    var el = document.getElementById('status');
    if (!el) return;
    el.textContent = text;
    if (found) el.classList.add('ar-status-found');
    else el.classList.remove('ar-status-found');
  }

  function showError(text) {
    var el = document.getElementById('status');
    if (el) {
      el.textContent = text;
      el.classList.add('ar-status-error');
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    var planterId = getParam('planter');
    var methodId = getParam('method');
    var infoEl = document.getElementById('info');
    var backEl = document.getElementById('back');

    // 「もどる」リンクは planter を維持して method.html に戻す
    if (backEl && planterId) {
      backEl.href = 'method.html?planter=' + encodeURIComponent(planterId);
    }

    if (!planterId || !methodId || !PLANTER_NAMES[planterId] || !METHOD_NAMES[methodId]) {
      showError('プランターまたは種まきの方法が選ばれていません。最初からやり直してください。');
      if (infoEl) infoEl.textContent = '';
      return;
    }

    if (infoEl) {
      infoEl.textContent = 'プランター：' + PLANTER_NAMES[planterId] +
        '　／　方法：' + METHOD_NAMES[methodId];
    }

    Promise.all([
      fetch('data/crops.json').then(function (r) { return r.json(); }),
      fetch('data/planters.json').then(function (r) { return r.json(); })
    ]).then(function (results) {
      var crops = results[0];
      var planters = results[1];
      var radish = Calculator.findCropById(crops, 'radish');
      var planter = Calculator.findPlanterById(planters, planterId);
      if (!radish || !planter) {
        showError('作物またはプランターのデータが見つかりません。');
        return;
      }

      var calc = Calculator.calculateSowing(radish, planter, methodId);
      var positions = methodId === 'row' ? calc.positions : calc.seedPositions;
      var color = methodId === 'row' ? COLOR_ROW : COLOR_POINT;

      placeCylinders(positions, planter, color);
      attachMarkerEvents();
    }).catch(function (e) {
      showError('データの読み込みに失敗しました：' + (e && e.message ? e.message : e));
    });
  });

  function placeCylinders(positions, planter, color) {
    var container = document.getElementById('seed-container');
    if (!container) return;
    var halfLen = planter.inner_length_cm / 2;

    for (var i = 0; i < positions.length; i++) {
      var p = positions[i];
      var ax = (p.x - halfLen) / 100;
      var az = -p.y / 100;
      var ay = CYL_H / 2 + Y_OFFSET;

      var cyl = document.createElement('a-cylinder');
      cyl.setAttribute('position', ax.toFixed(4) + ' ' + ay.toFixed(4) + ' ' + az.toFixed(4));
      cyl.setAttribute('radius', CYL_R);
      cyl.setAttribute('height', CYL_H);
      cyl.setAttribute('color', color);
      cyl.setAttribute('opacity', OPACITY);
      cyl.setAttribute('material', 'transparent: true; opacity: ' + OPACITY + '; color: ' + color);
      container.appendChild(cyl);
    }
  }

  function attachMarkerEvents() {
    var marker = document.getElementById('ar-marker');
    if (!marker) return;
    marker.addEventListener('markerFound', function () {
      showStatus('種をまきましょう', true);
    });
    marker.addEventListener('markerLost', function () {
      showStatus('マーカーをうつしてください', false);
    });
  }
})();
