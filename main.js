// @ts-check
const Trello = require('trello-helper')
const Gsweet = require('gsweet')
const moment = require('moment')

const COMMISSIONED_LIST_ID = '5a43cacb866f58773c0262c5'
const SHEET_ID = '1M9B7Rc5f8BD0eN8NIG39zkNJ0BTZdGP6k3608gEe-7A'

const formatDate = (date) => {
  return moment(date).format('YYYY-MM-DD')
}

const main = async () => {
  const trello = new Trello('/Users/tod-gentille/dev/node/ENV_VARS/trello.env.json')
  const gsweet = new Gsweet('/Users/tod-gentille/dev/node/ENV_VARS/gsweet.env.json')
  const {sheetOps} = gsweet


  const cardsFromList = await trello.getCardsOnList(COMMISSIONED_LIST_ID)

  const cardList = []
  cardList.push(['Name', 'Oldest Data', 'Date card moved to Board', '# board moves found'])
  for (const card of cardsFromList) {
    console.log(card.name, card.closed)

    const actions = await trello.getAllActionsOnCard(card.id)

    const lastItem = actions.length - 1
    const lastDate = actions[lastItem].date
    const fmtDate = formatDate(lastDate)
    const moveInfo = trello.getMoveCardToBoardInfo(actions)
    const cardData = [card.name, fmtDate]

    let formattedBoardMoveDate = ''
    if (moveInfo.date !== '') {
      formattedBoardMoveDate = formatDate(moveInfo.date)
    }
    cardData.push(formattedBoardMoveDate)
    cardData.push(moveInfo.status)
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