import fs from 'fs-extra'
import got from 'got'
import { JSDOM } from 'jsdom'

const yml = 'https://raw.githubusercontent.com/formulajs/formulajs.info/master/_data/functions.yml'
const url =
  'https://support.microsoft.com/en-us/office/excel-functions-alphabetical-b3944572-255d-4efb-bb96-c6d90033e188'

let functions = []
let data = ''

got(url)
  .then((response) => {
    const dom = new JSDOM(response.body)
    const rows = dom.window.document.querySelectorAll('.ocpIntroduction table tbody tr')

    rows.forEach((row) => {
      const name = row.querySelectorAll('td')[0].textContent.trim().split(' ')[0]
      const col2 = row.querySelectorAll('td')[1].textContent.trim().split(/:/)
      col2.shift()
      const description = col2.join(':').replace(/\n+/, '. ').replace(/\s+/g, ' ').trim()

      functions.push({ name, description })
    })

    got(yml).then((response) => {
      const ymlLines = response.body.split(/\n/)

      ymlLines.forEach((line) => {
        const func = line.includes('- title:') ? line.replace('- title: ', '').trim() : false

        data +=
          func && functions.some((f) => func === f.name)
            ? line + '\n    description: ' + functions.find((f) => func === f.name).description + '\n'
            : line + '\n'
      })

      fs.outputFileSync('functions.yml', data)
    })
  })
  .catch((err) => {
    console.log(err)
  })
