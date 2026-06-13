const HensyContent = (() => {
  let cachePromise;

  function getContent() {
    if (!cachePromise) {
      cachePromise = fetch("data/content.json", { cache: "no-store" }).then((response) => {
        if (!response.ok) throw new Error("Content JSON not found.");
        return response.json();
      });
    }

    return cachePromise;
  }

  function formatDate(value) {
    if (!value) return "";
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function getParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  return {
    getContent,
    formatDate,
    getParam,
  };
})();
