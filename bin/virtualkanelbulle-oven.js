#!/usr/bin/env node

const _ = require('lodash')

process.on('uncaughtException', error => {
  console.error(error)

  process.exit(1)
})

process.on('unhandledRejection', error => {
  console.error(error)

  process.exit(1)
})

const program = require('commander')

program
  .version('1.0.0')
  .parse(process.argv)

const VirtualKanelBulleOven = require('../lib')
const instance = new VirtualKanelBulleOven()

instance.getBuns()
  .then((buns) => {
    const currency = 'SEK'
    const head =
      `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
      <products xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="http://schemas.keybroker.com/productfeed_v1_2.xsd" currency="${currency}">`

    let body = ''
    _.forEach(buns, (bun, index) => {
      const subCategory = bun.isSticky ? 'Sticky' : 'Not sticky'
      const priceWithTax = bun.popularity
      body +=
        `<product sku="${index}">
          <category>${bun.type}</category>
          <subCategory>${subCategory}</subCategory>
          <manufacturer>VirtualKanelbulle AB</manufacturer>
          <modelName>${bun.name}</modelName>
          <priceWithTax>${priceWithTax}</priceWithTax>
          <productUrl><![CDATA[${bun.url}]]></productUrl>
          <imageUrl><![CDATA[${bun.imageUrl}]]></imageUrl>
        </product>`
    })

    const tail = `</products>`

    console.log(`${head}${body}${tail}`)
  })
  .catch((error) => console.error(error))
