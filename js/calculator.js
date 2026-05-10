/*
 * 種まき支援AR — 播種位置計算ロジック
 * 仕様書 §3.2.3 を実装。
 *
 * 座標系：プランター内寸の左下隅を原点 (0, 0)。
 *   x 軸 = 長辺方向（cm）／ y 軸 = 短辺方向（cm）。
 * 戻り値の数値はすべて cm 単位。
 */
(function (global) {
  'use strict';

  var EPS = 1e-9;

  // ---------- すじまき ----------
  function calculateRowSowing(crop, planter) {
    var cfg = crop.row_sowing;
    if (!cfg) throw new Error('crop has no row_sowing config: ' + crop.crop_id);

    var length = planter.inner_length_cm;
    var width = planter.inner_width_cm;
    var margin = cfg.long_edge_margin_cm;
    var spacing = cfg.plant_spacing_cm;
    var rowCount = cfg.row_count;
    var rowSpacing = cfg.row_spacing_cm;

    // 1条あたりの株数 = (長辺長 - 長辺余白×2) ÷ 株間
    var plantsPerRow = Math.floor((length - 2 * margin) / spacing + EPS);

    // 株 x 座標：margin + spacing から spacing 刻み（両端を含まない内側配置）
    var plantXs = [];
    for (var k = 1; k <= plantsPerRow; k++) {
      plantXs.push(margin + k * spacing);
    }

    // 短辺余白 = (短辺長 - 条間×(条数-1)) / 2
    var shortMargin = (width - rowSpacing * (rowCount - 1)) / 2;
    var rowYs = [];
    for (var r = 0; r < rowCount; r++) {
      rowYs.push(shortMargin + r * rowSpacing);
    }

    var positions = [];
    for (var i = 0; i < rowYs.length; i++) {
      for (var j = 0; j < plantXs.length; j++) {
        positions.push({ x: plantXs[j], y: rowYs[i] });
      }
    }

    return {
      method: 'row',
      rowCount: rowCount,
      plantsPerRow: plantsPerRow,
      shortMargin: shortMargin,
      rowYs: rowYs,
      plantXs: plantXs,
      positions: positions,
      totalCount: positions.length,
    };
  }

  // ---------- 点まき ----------
  function calculatePointSowing(crop, planter) {
    var cfg = crop.point_sowing;
    if (!cfg) throw new Error('crop has no point_sowing config: ' + crop.crop_id);

    var shortHoles = cfg.short_side_holes && cfg.short_side_holes[planter.planter_id];
    if (!shortHoles) {
      throw new Error(
        'point_sowing.short_side_holes is missing for planter: ' + planter.planter_id
      );
    }

    var length = planter.inner_length_cm;
    var width = planter.inner_width_cm;
    var margin = cfg.long_edge_margin_cm;
    var spacing = cfg.spacing_cm;

    // 長辺方向の穴数 = floor((長辺長 - 余白×2) / 穴間隔) + 1
    var longHoles = Math.floor((length - 2 * margin) / spacing + EPS) + 1;
    var holeXs = [];
    for (var i = 0; i < longHoles; i++) {
      holeXs.push(margin + i * spacing);
    }

    // 短辺余白 = (短辺長 - 穴間隔×(短辺穴数-1)) / 2
    var shortMargin = (width - spacing * (shortHoles - 1)) / 2;
    var holeYs = [];
    for (var j = 0; j < shortHoles; j++) {
      holeYs.push(shortMargin + j * spacing);
    }

    var holeCenters = [];
    for (var jy = 0; jy < holeYs.length; jy++) {
      for (var ix = 0; ix < holeXs.length; ix++) {
        holeCenters.push({ x: holeXs[ix], y: holeYs[jy] });
      }
    }

    var seedsPerHole = cfg.seeds_per_hole;
    var side = cfg.triangle_side_cm;
    var seedOffsets = computeTriangleOffsets(seedsPerHole, side);

    var seedPositions = [];
    for (var hi = 0; hi < holeCenters.length; hi++) {
      var c = holeCenters[hi];
      for (var si = 0; si < seedOffsets.length; si++) {
        var off = seedOffsets[si];
        seedPositions.push({
          x: c.x + off.x,
          y: c.y + off.y,
          holeIndex: hi,
          seedIndex: si,
        });
      }
    }

    return {
      method: 'point',
      longHoles: longHoles,
      shortHoles: shortHoles,
      shortMargin: shortMargin,
      holeXs: holeXs,
      holeYs: holeYs,
      holeCenters: holeCenters,
      seedsPerHole: seedsPerHole,
      triangleSideCm: side,
      seedPositions: seedPositions,
      totalHoles: holeCenters.length,
      totalSeeds: seedPositions.length,
    };
  }

  // 中心を原点とする n 点配置のオフセット（cm）
  // n=3 のとき：頂点1つが +y、他2つが -y 側に左右対称な正三角形
  function computeTriangleOffsets(n, side) {
    if (n === 3) {
      var R3 = side / Math.sqrt(3);
      return [
        { x: 0, y: R3 },
        { x: -side / 2, y: -R3 / 2 },
        { x: side / 2, y: -R3 / 2 },
      ];
    }
    // 拡張：n 等分円上に配置（将来の作物追加に備える）
    var R = side / (2 * Math.sin(Math.PI / n));
    var offs = [];
    for (var i = 0; i < n; i++) {
      var angle = Math.PI / 2 + (2 * Math.PI * i) / n;
      offs.push({ x: R * Math.cos(angle), y: R * Math.sin(angle) });
    }
    return offs;
  }

  // ラッパー：method 文字列で振り分け
  function calculateSowing(crop, planter, method) {
    if (method === 'row') return calculateRowSowing(crop, planter);
    if (method === 'point') return calculatePointSowing(crop, planter);
    throw new Error('unknown sowing method: ' + method);
  }

  // ---------- データ読込みヘルパー ----------
  function findCropById(cropsJson, cropId) {
    var list = cropsJson.crops || [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].crop_id === cropId) return list[i];
    }
    return null;
  }

  function findPlanterById(plantersJson, planterId) {
    var list = plantersJson.planters || [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].planter_id === planterId) return list[i];
    }
    return null;
  }

  global.Calculator = {
    calculateRowSowing: calculateRowSowing,
    calculatePointSowing: calculatePointSowing,
    calculateSowing: calculateSowing,
    findCropById: findCropById,
    findPlanterById: findPlanterById,
    _internal: { computeTriangleOffsets: computeTriangleOffsets, EPS: EPS },
  };
})(typeof window !== 'undefined' ? window : globalThis);
