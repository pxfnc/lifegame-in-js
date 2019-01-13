var Cell = class Cell {

    constructor(x, y, row) {
        this.__cell = document.createElement('div')
        this.__cell.style.display = "inline-block"
        this.__cell.style.width = "14px"
        this.__cell.style.height = "14px"
        this.__cell.style.border = "solid 1px"
        this.__cell.addEventListener('click', () => this.paint())
        row.appendChild(this.__cell)
    }

    paint() {
        this.__cell.style.backgroundColor = "black"
    }

    clear() {
        this.__cell.style.backgroundColor = ""
    }

    painted() {
        return this.__cell.style.backgroundColor === "black"
    }

}


var Board = class Board {

    constructor(N, selector) {
        // viewの作成
        const table = document.createElement('div')

        this.__N = N
        this.__state = [...Array(N).keys()].map(x => {

            const row = document.createElement('div')
            row.style.margin = 0
            row.style.padding = 0
            row.style.height = '14px'
            table.appendChild(row)
            return [...Array(N).keys()].map(y => new Cell(x, y, row))

        })

        this.__timer = null

        document.querySelector(selector).appendChild(table)
    }

    start() {
        if (this.__timer !== null) return

        this.__timer = setInterval(() => this.update(), 100)
    }

    stop() {
        if (this.__timer === null) return

        clearInterval(this.__timer)
        this.__timer = null

    }

    update() {
        // 普通の平面での次の状態を求めるロジック
        const getNextState = (state, N) => (x, y) => {

            // const arroundLives = arroundLivesCount(x, y, state, N)
            const arroundLives = arroundLivesCountOnTorus(x, y, state, N)

            return arroundLives === 3 || state[x][y] && arroundLives == 2
        }

        const current = this.__state.map(row => row.map(cell => cell.painted()))
        const nextState = getNextState(current, this.__N)
        const next = current.map((row, x) => row.map((_, y) => nextState(x, y)))

        next.forEach((row, x) => row.forEach((live, y) => live ? this.__state[x][y].paint() : this.__state[x][y].clear()))

    }

    clear() {
        this.__state.forEach(row => row.forEach(cell => cell.clear()))
    }
}

/**
 * 周囲の生きてるセルをカウントする
 * @param {number} row 行
 * @param {number} column 列 
 * @param {boolean[][]} state boolean[][]な配列
 * @param {number} N stateの一辺の長さ
 */
const arroundLivesCount = (row, column, state, N) => [].concat(
    ...[-1, 0, 1].map(
        a => [-1, 0, 1].map(
            b => [row + a, column + b]
        )
    ) // 数学的に言うと、{-1, 0, 1}^2という集合を作って全ての元にrow, columnのオフセットを足してる。
).filter(
    ([a, b]) => // そのような数字の組[a, b]から
        !(a == row && b == column) // aとbの組みが注目してる座標でない
        && Math.min(a, b) >= 0 // かつ、座標が下限より大きい
        && Math.max(a, b) < N // かつ、座標が上限より小さい
        && state[a][b] // かつその座標で生きてるマス
).length // の長さを取得


// トーラス上の計算
const arroundLivesCountOnTorus = (row, column, state, N) => [].concat(
    ...[-1, 0, 1].map(
        a => [-1, 0, 1].map(
            b => [(row + a + N) % N, (column + b + N) % N] // modにすることで範囲外のアクセスを防ぐ
        )
    )
).filter(
    ([a, b]) =>
        !(a == row && b == column)
        && Math.min(a, b) >= 0
        && Math.max(a, b) < N
        && state[a][b]
).length