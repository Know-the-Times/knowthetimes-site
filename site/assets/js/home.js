// Fills the two "latest posts" lists on the home page from /api/posts,
// which reads both Substack feeds (see netlify/functions/posts.mjs).

(function () {
  var ARCHIVES = {
    ktt: "https://knowthetimes.substack.com/archive",
    tfr: "https://thefaithfulremnant.substack.com/archive",
  };

  var yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  function formatDate(iso) {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  }

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text) node.textContent = text;
    return node;
  }

  function render(list, posts, key) {
    list.innerHTML = "";
    if (!posts || !posts.length) {
      var note = el("li");
      var p = el("p", "feed-note", "The latest posts couldn't be loaded right now. ");
      var a = el("a", null, "Read them on Substack");
      a.href = ARCHIVES[key];
      p.appendChild(a);
      note.appendChild(p);
      list.appendChild(note);
      return;
    }
    posts.forEach(function (post) {
      var li = el("li", "post" + (post.image ? "" : " no-thumb"));
      var a = el("a");
      a.href = post.url;
      if (post.image) {
        var img = el("img", "post-thumb");
        img.src = post.image;
        img.alt = "";
        img.loading = "lazy";
        a.appendChild(img);
      }
      var text = el("span", "post-text");
      text.appendChild(el("span", "post-title", post.title));
      if (post.subtitle) text.appendChild(el("span", "post-sub", post.subtitle));
      if (post.date) text.appendChild(el("span", "post-date", formatDate(post.date)));
      a.appendChild(text);
      li.appendChild(a);
      list.appendChild(li);
    });
  }

  var lists = document.querySelectorAll("[data-feed]");
  fetch("/api/posts")
    .then(function (res) { if (!res.ok) throw new Error(res.status); return res.json(); })
    .then(function (data) {
      lists.forEach(function (list) { render(list, data[list.dataset.feed], list.dataset.feed); });
    })
    .catch(function () {
      lists.forEach(function (list) { render(list, [], list.dataset.feed); });
    });
})();
