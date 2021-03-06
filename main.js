// @ts-check
const Trello = require('trello-helper')
const Gsweet = require('gsweet')
const moment = require('moment')

const COMMISSIONED_LIST_ID = '5a43cacb866f58773c0262c5'
const SHEET_ID = '1M9B7Rc5f8BD0eN8NIG39zkNJ0BTZdGP6k3608gEe-7A'
// https://docs.google.com/spreadsheets/d/1M9B7Rc5f8BD0eN8NIG39zkNJ0BTZdGP6k3608gEe-7A

const formatDate = (date) => moment(date).format('YYYY-MM-DD')

const main = async () => {
  const trello = new Trello('/Users/tod-gentille/dev/node/ENV_VARS/trello.env.json')
  const gsweet = new Gsweet('/Users/tod-gentille/dev/node/ENV_VARS/gsweet.env.json')
  const {sheetOps} = gsweet


  const cardsFromList = await trello.getCardsOnList({id: COMMISSIONED_LIST_ID, options: {}})
  const cardList = []
  cardList.push(['Name', 'Oldest Data', 'Date card moved to Board', '# board moves found'])
  for (const card of cardsFromList) {
    console.log(card.name, card.closed)

    const actions = await trello.getAllActionsOnCard(card.id)

    const lastItem = actions.length - 1
    const lastDate = actions[lastItem].date
    const fmtDate = formatDate(lastDate)
    const moved = trello.getMoveCardToBoardActions(actions)
    const cardData = [card.name, fmtDate]

    let formattedBoardMoveDate = ''
    if (moved.length > 0) {
      formattedBoardMoveDate = formatDate(moved[0].date)
    }
    cardData.push(formattedBoardMoveDate)
    cardData.push(moved.length)
    cardList.push(cardData)
  }
  console.log(cardList)
  sheetOps.setRangeData({id: SHEET_ID, range: 'Sheet1!A1', value: '', data: cardList})
  setLastUpdated(sheetOps)
}

const setLastUpdated = (sheetOps) => {
  const lastUpdate = `last updated ${moment().format('YYYY-MM-DD hh:mm A')}`
  sheetOps.setRangeData({
    id: SHEET_ID, range: 'Sheet1!E1', data: [[lastUpdate]],
  })
}

main()