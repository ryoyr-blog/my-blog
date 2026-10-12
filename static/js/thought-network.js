(() => {
  const network = document.querySelector("[data-thought-network]");
  if (!network) return;

  const svg = network.querySelector(".thought-network-canvas");
  const source = network.querySelector(".thought-network-source");
  const svgNS = "http://www.w3.org/2000/svg";

  const themes = [...source.querySelectorAll('[data-kind="theme"]')].map((element) => ({
    id: element.dataset.id,
    kind: "theme",
    label: element.dataset.label,
    description: element.dataset.description,
  }));
  const articles = [...source.querySelectorAll('[data-kind="article"]')].map((element) => ({
    id: element.dataset.id,
    kind: "article",
    label: element.dataset.short || element.textContent.trim(),
    title: element.textContent.trim(),
    description: element.dataset.description,
    theme: element.dataset.theme,
    tags: element.dataset.tags.split("|").filter(Boolean),
    url: element.href,
  }));

  const tagCounts = new Map();
  articles.forEach((article) => article.tags.forEach((tag) => {
    tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
  }));
  const tags = [...tagCounts].filter(([, count]) => count > 1).map(([label]) => ({
    id: `tag-${label}`,
    kind: "tag",
    label,
  }));
  const nodes = [{ id: "root", kind: "root", label: "思考" }, ...themes, ...articles, ...tags];
  const edges = [
    ...themes.map((theme) => ({ from: "root", to: theme.id, kind: "main" })),
    ...articles.map((article) => ({ from: article.theme, to: article.id, kind: "main" })),
    ...articles.flatMap((article) => article.tags.filter((tag) => tagCounts.get(tag) > 1).map((tag) => ({
      from: article.id,
      to: `tag-${tag}`,
      kind: "tag",
    }))),
  ];

  // 手で決めた座標の配置。座標がない記事やタグは，同心円の配置の位置で補う。
  const fixedLayouts = {
    desktop: {
      size: [1000, 620],
      root: [500, 300],
      themes: [[260, 170], [690, 160], [650, 440]],
      articles: [[[100, 90], [110, 350]], [[820, 70], [875, 260]], [[865, 450], [780, 565]]],
      tags: {
        意識: [415, 110], 哲学: [305, 35], 一人称性: [170, 235], 自己: [375, 385],
        主観経験: [485, 210], 記憶: [530, 65], 同一性: [260, 490], AI: [900, 155],
        自己認識: [510, 545], 批評: [920, 550], 思考実験: [490, 145],
      },
    },
    mobile: {
      size: [400, 700],
      root: [200, 345],
      themes: [[115, 180], [295, 265], [125, 510]],
      articles: [[[40, 80], [45, 310]], [[350, 100], [350, 400]], [[60, 640], [275, 635]]],
      tags: {
        意識: [205, 75], 哲学: [95, 30], 一人称性: [35, 220], 自己: [115, 395],
        主観経験: [225, 215], 記憶: [265, 90], 同一性: [45, 445], AI: [355, 180],
        自己認識: [245, 555], 批評: [350, 545], 思考実験: [170, 145],
      },
    },
  };

  function calculateFixedLayout(mobile) {
    const layout = fixedLayouts[mobile ? "mobile" : "desktop"];
    const [width, height] = layout.size;
    const positions = new Map([["root", layout.root]]);
    themes.forEach((theme, groupIndex) => {
      if (layout.themes[groupIndex]) positions.set(theme.id, layout.themes[groupIndex]);
      articles.filter((article) => article.theme === theme.id).forEach((article, articleIndex) => {
        const position = layout.articles[groupIndex]?.[articleIndex];
        if (position) positions.set(article.id, position);
      });
    });
    tags.forEach((tag) => {
      if (layout.tags[tag.label]) positions.set(tag.id, layout.tags[tag.label]);
    });
    if (positions.size < nodes.length) {
      // 座標のない点は，同心円の配置を同じ横幅に縮めた位置に置く
      const radial = calculateRadialLayout(mobile);
      const scaleY = height / radial.height;
      nodes.forEach((node) => {
        if (positions.has(node.id)) return;
        const [x, y] = radial.positions.get(node.id);
        positions.set(node.id, [x, y * scaleY]);
      });
    }
    return { width, height, positions };
  }

  function permutations(list) {
    if (list.length <= 1) return [list];
    return list.flatMap((item, index) => permutations([...list.slice(0, index), ...list.slice(index + 1)])
      .map((rest) => [item, ...rest]));
  }

  // テーマと記事を円に並べる順番を決める。タグを共有する記事の組ほど近くに並べる。
  // 画面の幅によらないので，一度だけ計算して使い回す。
  let circleOrder = null;
  function chooseCircleOrder() {
    if (circleOrder) return circleOrder;
    const shared = articles.map((article) => article.tags.filter((tag) => tagCounts.get(tag) > 1));
    const weights = articles.map((_, a) => articles.map((__, b) => (
      a === b ? 0 : shared[a].filter((tag) => shared[b].includes(tag)).length
    )));
    const flatten = (inner) => inner.flatMap((members) => (members.length ? members : [null]));
    const cost = (inner) => {
      const slots = flatten(inner);
      let total = 0;
      for (let i = 0; i < slots.length; i += 1) {
        for (let j = i + 1; j < slots.length; j += 1) {
          if (slots[i] !== null && slots[j] !== null) total += weights[slots[i]][slots[j]] * Math.sin(Math.PI * (j - i) / slots.length);
        }
      }
      return total;
    };

    // テーマの並べ方は5つまでなら全部試し，テーマ内の記事は2つずつ入れ替えて良くなる限り続ける
    const groups = themes.map((theme) => articles.flatMap((article, index) => (article.theme === theme.id ? [index] : [])));
    const identity = groups.map((_, index) => index);
    const themeOrders = groups.length <= 5 ? permutations(identity) : [identity];
    let best = null;
    themeOrders.forEach((themeOrder) => {
      const inner = themeOrder.map((group) => [...groups[group]]);
      let current = cost(inner);
      let improved = true;
      while (improved) {
        improved = false;
        inner.forEach((members) => {
          for (let i = 0; i < members.length; i += 1) {
            for (let j = i + 1; j < members.length; j += 1) {
              [members[i], members[j]] = [members[j], members[i]];
              const swapped = cost(inner);
              if (swapped < current - 1e-9) {
                current = swapped;
                improved = true;
              } else [members[i], members[j]] = [members[j], members[i]];
            }
          }
        });
      }
      if (!best || current < best.cost - 1e-9) best = { cost: current, themeOrder, inner };
    });
    circleOrder = { themeOrder: best.themeOrder, inner: best.inner, slots: flatten(best.inner).length };
    return circleOrder;
  }

  // 「思考」を中心に，テーマを内側，記事を外側の楕円に置き，タグはつながる記事の間に置く。
  // 最後に軽く力で整える。乱数は使わないので，毎回同じ配置になる。
  function calculateRadialLayout(mobile) {
    const width = mobile ? 400 : 1000;
    const padding = mobile ? 10 : 16;
    // 横幅は固定なので，記事が増えたら楕円を縦に伸ばす
    const tall = Math.max(mobile ? 300 : 235, articles.length * (mobile ? 17 : 11));
    const rings = mobile
      ? { theme: [70, tall * .43], article: [140, tall], tag: .75 }
      : { theme: [140, tall * .39], article: [345, tall], tag: .8 };
    const offset = mobile ? 0 : -Math.PI / 2;
    const best = chooseCircleOrder();

    const homes = new Map([["root", [0, 0]]]);
    const onEllipse = ([rx, ry], angle) => [Math.cos(angle) * rx, Math.sin(angle) * ry];
    const step = Math.PI * 2 / best.slots;
    let slot = 0;
    best.themeOrder.forEach((group, index) => {
      const members = best.inner[index];
      const count = Math.max(1, members.length);
      homes.set(themes[group].id, onEllipse(rings.theme, offset + (slot + count / 2) * step));
      members.forEach((article, position) => {
        homes.set(articles[article].id, onEllipse(rings.article, offset + (slot + position + .5) * step));
      });
      slot += count;
    });
    tags.forEach((tag, index) => {
      const linked = articles.filter((article) => article.tags.includes(tag.label)).map((article) => homes.get(article.id));
      const x = linked.reduce((sum, [px]) => sum + px, 0) / linked.length;
      const y = linked.reduce((sum, [, py]) => sum + py, 0) / linked.length;
      // 同じ記事の組をつなぐタグが同じ点に重ならないよう，少しずつずらして置く
      const nudge = index * 2.399963;
      homes.set(tag.id, [x * rings.tag + Math.cos(nudge) * 6, y * rings.tag + Math.sin(nudge) * 6]);
    });

    const context = document.createElement("canvas").getContext("2d");
    const fontFamily = getComputedStyle(svg).fontFamily;
    const fontSizes = { root: 22, theme: 19, article: 17, tag: 13 };
    const items = nodes.map((node) => {
      const [x, y] = homes.get(node.id);
      context.font = `${node.kind === "tag" ? 480 : 650} ${fontSizes[node.kind]}px ${fontFamily}`;
      return {
        node, x, y, homeX: x, homeY: y,
        dot: { root: 12, theme: 8, article: 6, tag: 3.5 }[node.kind],
        halfHeight: fontSizes[node.kind] * .72,
        labelWidth: mobile && node.kind === "tag" ? 0 : context.measureText(node.label).width,
        // 文字は中心から外向きに出す
        side: node.kind !== "root" && x < -1 ? "end" : "start",
      };
    });
    const byId = new Map(items.map((item) => [item.node.id, item]));
    const half = width / 2;
    const box = (item) => {
      const label = item.labelWidth ? item.labelWidth + 15 : item.dot + 2;
      return {
        left: item.x - (item.side === "end" ? label : item.dot + 2),
        right: item.x + (item.side === "end" ? item.dot + 2 : label),
        top: item.y - Math.max(item.halfHeight, item.dot + 2),
        bottom: item.y + Math.max(item.halfHeight, item.dot + 2),
      };
    };
    // 外向きの文字が画面からはみ出すときは内向きにする
    const fitSide = (item) => {
      const bounds = box(item);
      if (bounds.left < padding - half || bounds.right > half - padding) item.side = item.side === "end" ? "start" : "end";
    };
    items.forEach(fitSide);

    // 文字を含めた四角が重ならないように離す
    function separateLabels() {
      for (let i = 0; i < items.length; i += 1) {
        for (let j = i + 1; j < items.length; j += 1) {
          const a = items[i];
          const b = items[j];
          const ab = box(a);
          const bb = box(b);
          const overlapX = Math.min(ab.right, bb.right) - Math.max(ab.left, bb.left);
          const overlapY = Math.min(ab.bottom, bb.bottom) - Math.max(ab.top, bb.top);
          if (overlapX <= 0 || overlapY <= 0) continue;
          const share = a.node.kind === "root" ? [0, 1] : b.node.kind === "root" ? [1, 0] : [.5, .5];
          if (overlapX < overlapY * 1.6) {
            const direction = (ab.left + ab.right) < (bb.left + bb.right) ? 1 : -1;
            a.x -= (overlapX + 1) * share[0] * direction;
            b.x += (overlapX + 1) * share[1] * direction;
          } else {
            const direction = a.y < b.y ? 1 : -1;
            a.y -= (overlapY + 1) * share[0] * direction;
            b.y += (overlapY + 1) * share[1] * direction;
          }
        }
      }
      items.forEach((item) => {
        const bounds = box(item);
        item.x += Math.max(0, padding - half - bounds.left) - Math.max(0, bounds.right - half + padding);
      });
    }

    const tagEdges = edges.filter((edge) => edge.kind === "tag").map((edge) => [byId.get(edge.from), byId.get(edge.to)]);
    const repulsion = mobile ? 34 : 46;
    for (let iteration = 0; iteration < 260; iteration += 1) {
      const heat = 1 - iteration / 260;
      // 点どうしを押し離す
      for (let i = 0; i < items.length; i += 1) {
        for (let j = i + 1; j < items.length; j += 1) {
          const a = items[i];
          const b = items[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const distance = Math.max(4, Math.hypot(dx, dy));
          const push = Math.min(6, repulsion * repulsion / (distance * distance)) * heat;
          const share = a.node.kind === "root" ? [0, 1] : b.node.kind === "root" ? [1, 0] : [.5, .5];
          a.x -= dx / distance * push * share[0];
          a.y -= dy / distance * push * share[0];
          b.x += dx / distance * push * share[1];
          b.y += dy / distance * push * share[1];
        }
      }
      // タグを記事へ引き寄せる
      tagEdges.forEach(([article, tag]) => {
        const dx = article.x - tag.x;
        const dy = article.y - tag.y;
        const distance = Math.max(1, Math.hypot(dx, dy));
        const pull = Math.max(0, distance - (mobile ? 55 : 70)) * .02 * heat;
        tag.x += dx / distance * pull;
        tag.y += dy / distance * pull;
      });
      // テーマと記事は楕円上の位置へ，タグは最初の位置へ弱く戻す
      items.forEach((item) => {
        if (item.node.kind === "root") return;
        const anchor = item.node.kind === "tag" ? .02 : .12;
        item.x += (item.homeX - item.x) * anchor;
        item.y += (item.homeY - item.y) * anchor;
      });
      separateLabels();
    }
    // 最後は重なりを解くことだけを繰り返す
    for (let iteration = 0; iteration < 60; iteration += 1) separateLabels();

    // 横幅は固定し，高さは配置の上下に合わせる
    const top = Math.min(...items.map((item) => box(item).top)) - padding;
    const bottom = Math.max(...items.map((item) => box(item).bottom)) + padding;
    return {
      width,
      height: Math.ceil(bottom - top),
      positions: new Map(items.map((item) => [item.node.id, [item.x + half, item.y - top]])),
    };
  }

  function svgElement(name, attributes = {}) {
    const element = document.createElementNS(svgNS, name);
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
    return element;
  }

  let nodeElements = [];
  let edgeElements = [];
  let selectedId = null;
  let nodeStates = [];
  let stateById = new Map();
  let dragState = null;
  let returnFrame = null;
  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

  function clearHighlight() {
    selectedId = null;
    nodeElements.forEach(({ element }) => element.classList.remove("is-active", "is-dimmed"));
    edgeElements.forEach(({ element }) => element.classList.remove("is-active", "is-dimmed"));
  }

  function select(node) {
    selectedId = node.id;
    const connected = new Set([node.id]);
    edges.forEach((edge) => {
      if (edge.from === node.id) connected.add(edge.to);
      if (edge.to === node.id) connected.add(edge.from);
    });
    nodeElements.forEach(({ node: other, element }) => {
      element.classList.toggle("is-active", other.id === node.id);
      element.classList.toggle("is-dimmed", !connected.has(other.id));
    });
    edgeElements.forEach(({ edge, element }) => {
      element.classList.toggle("is-active", edge.from === node.id || edge.to === node.id);
      element.classList.toggle("is-dimmed", edge.from !== node.id && edge.to !== node.id);
    });

  }

  function activate(node) {
    select(node);
    if (node.kind === "article") window.location.assign(node.url);
  }

  function updateGraphPositions() {
    nodeStates.forEach((item) => {
      item.element.setAttribute("transform", `translate(${item.x} ${item.y})`);
    });
    edgeElements.forEach(({ edge, element }) => {
      const from = stateById.get(edge.from);
      const to = stateById.get(edge.to);
      element.setAttribute("x1", from.x);
      element.setAttribute("y1", from.y);
      element.setAttribute("x2", to.x);
      element.setAttribute("y2", to.y);
    });
  }

  // ドラッグを離した点を，元の場所へ減速しながら戻す
  function returnHome(item) {
    if (motionPreference.matches) {
      item.x = item.homeX;
      item.y = item.homeY;
      updateGraphPositions();
      return;
    }
    item.returning = { fromX: item.x, fromY: item.y, start: performance.now() };
    if (returnFrame === null) returnFrame = requestAnimationFrame(stepReturn);
  }

  function stepReturn(time) {
    returnFrame = null;
    let active = false;
    nodeStates.forEach((item) => {
      if (!item.returning) return;
      const { fromX, fromY, start } = item.returning;
      const progress = Math.min(Math.max((time - start) / 600, 0), 1);
      const eased = 1 - (1 - progress) ** 3;
      item.x = fromX + (item.homeX - fromX) * eased;
      item.y = fromY + (item.homeY - fromY) * eased;
      if (progress === 1) item.returning = null;
      else active = true;
    });
    updateGraphPositions();
    if (active) returnFrame = requestAnimationFrame(stepReturn);
  }

  function render() {
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    if (returnFrame !== null) cancelAnimationFrame(returnFrame);
    returnFrame = null;
    dragState = null;
    network.classList.remove("is-dragging");
    const { width, height, positions } = calculateFixedLayout(mobile);
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.style.aspectRatio = `${width} / ${height}`;
    svg.replaceChildren();
    nodeElements = [];
    edgeElements = [];

    const lines = svgElement("g", { class: "thought-network-edges", "aria-hidden": "true" });
    edges.forEach((edge) => {
      const [x1, y1] = positions.get(edge.from);
      const [x2, y2] = positions.get(edge.to);
      const line = svgElement("line", { x1, y1, x2, y2, class: `thought-network-edge thought-network-edge--${edge.kind}` });
      lines.append(line);
      edgeElements.push({ edge, element: line });
    });
    svg.append(lines);

    const dots = svgElement("g", { class: "thought-network-nodes" });
    nodes.forEach((node) => {
      const [x, y] = positions.get(node.id);
      const group = svgElement("g", {
        class: `thought-network-node thought-network-node--${node.kind}`,
        transform: `translate(${x} ${y})`,
        role: node.kind === "article" ? "link" : "button",
        tabindex: "0",
        "aria-label": `${node.kind === "article" ? "記事を開く" : node.kind === "tag" ? "タグ" : node.kind === "root" ? "思考の地図" : "テーマ"}: ${node.title || node.label}`,
      });
      const anchor = x > width * .72 ? "end" : "start";
      group.append(svgElement("circle", { class: "thought-network-hit", r: mobile ? 24 : 19 }));
      const dotRadius = { root: 12, theme: 8, article: 6, tag: 3.5 }[node.kind];
      group.append(svgElement("circle", { class: "thought-network-dot", r: dotRadius }));
      const label = svgElement("text", { x: anchor === "end" ? -13 : 13, y: 4, "text-anchor": anchor });
      label.textContent = node.label;
      group.append(label);
      group.addEventListener("pointerenter", (event) => {
        if (event.pointerType === "mouse" || event.pointerType === "pen") select(node);
      });
      group.addEventListener("pointerleave", (event) => {
        if ((event.pointerType === "mouse" || event.pointerType === "pen") && !group.matches(":focus-visible")) {
          clearHighlight();
        }
      });
      group.addEventListener("focus", () => select(node));
      group.addEventListener("blur", (event) => {
        if (!event.relatedTarget?.classList?.contains("thought-network-node")) clearHighlight();
      });
      group.addEventListener("click", (event) => {
        if (group.dataset.dragged === "true") {
          event.preventDefault();
          delete group.dataset.dragged;
          return;
        }
        activate(node);
      });
      group.addEventListener("pointerdown", (event) => {
        if (event.button !== 0 || node.kind === "root") return;
        const item = stateById.get(node.id);
        if (!item) return;
        item.returning = null;
        dragState = {
          item,
          pointerId: event.pointerId,
          startX: event.clientX,
          startY: event.clientY,
          startNodeX: item.x,
          startNodeY: item.y,
          moved: false,
        };
        group.setPointerCapture(event.pointerId);
        network.classList.add("is-dragging");
      });
      group.addEventListener("pointermove", (event) => {
        if (!dragState || dragState.pointerId !== event.pointerId) return;
        const rect = svg.getBoundingClientRect();
        const scaleX = width / rect.width;
        const scaleY = height / rect.height;
        const dx = (event.clientX - dragState.startX) * scaleX;
        const dy = (event.clientY - dragState.startY) * scaleY;
        if (Math.hypot(dx, dy) > 4) dragState.moved = true;
        if (!dragState.moved) return;
        dragState.item.x = Math.max(16, Math.min(dragState.startNodeX + dx, width - 16));
        dragState.item.y = Math.max(18, Math.min(dragState.startNodeY + dy, height - 18));
        updateGraphPositions();
      });
      const finishDrag = (event) => {
        if (!dragState || dragState.pointerId !== event.pointerId) return;
        if (dragState.moved) {
          group.dataset.dragged = "true";
          returnHome(dragState.item);
        } else if (dragState.item.x !== dragState.item.homeX || dragState.item.y !== dragState.item.homeY) {
          returnHome(dragState.item);
        }
        dragState = null;
        network.classList.remove("is-dragging");
      };
      group.addEventListener("pointerup", finishDrag);
      group.addEventListener("pointercancel", finishDrag);
      group.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          activate(node);
        }
      });
      dots.append(group);
      nodeElements.push({ node, element: group });
    });
    svg.append(dots);

    nodeStates = nodeElements.map(({ node, element }) => {
      const [x, y] = positions.get(node.id);
      return { node, element, x, y, homeX: x, homeY: y, returning: null };
    });
    stateById = new Map(nodeStates.map((item) => [item.node.id, item]));

    if (selectedId) {
      const selected = nodes.find((node) => node.id === selectedId);
      if (selected) select(selected);
    }
  }

  render();
  // 文字の幅を正しく測るため，フォントが読み込まれたら配置し直す
  document.fonts?.ready.then(render);
  const breakpoint = window.matchMedia("(max-width: 767px)");
  breakpoint.addEventListener("change", render);
})();
