class Paginator extends EventTarget {
    pageCount = 1;
    pageIndex = 0;

    _root;
    _prevElem;
    _pageElem;
    _next;

    _name;

    constructor(id, pageCount, startPage = 1, name = "Page") {
        super();

        this.pageCount = pageCount;
        this.pageIndex = startPage - 1;

        this._name = name;

        this._root = document.getElementById(id);
        if (!this._root.classList.contains("paginator")) {
            this._root.classList.add("paginator");
        }

        this._prevElem = document.createElement("div");
        this._prevElem.addEventListener("click", this.prev.bind(this));
        this._root.appendChild(this._prevElem);
        
        this._pageElem = document.createElement("div");
        this._root.appendChild(this._pageElem);
        
        this._nextElem = document.createElement("div");
        this._nextElem.addEventListener("click", this.next.bind(this));
        this._root.appendChild(this._nextElem);

        this._updatePage();
    }

    _updatePage() {
        this._pageElem.innerText = `${this._name} ${this.pageIndex+1}/${this.pageCount}`;

        this._prevElem.className = this.pageIndex > 0 ? "hasMore" : "";
        this._nextElem.className = (this.pageIndex < this.pageCount - 1) ? "hasMore" : "";
    }

    prev() {
        if (this.pageIndex > 0) {
            const event = new CustomEvent("change", {page: this.pageIndex - 1});
            if (this.dispatchEvent(event)) {
                this.pageIndex--;
                this._updatePage();
            }
        }
    }

    next() {
        if (this.pageIndex < this.pageCount - 1) {
            const event = new CustomEvent("change", {page: this.pageIndex + 1});
            if (this.dispatchEvent(event)) {
                this.pageIndex++;
                this._updatePage();
            }
        }
    }
}