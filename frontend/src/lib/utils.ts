import { createCn } from "cn/config"

const TYPOGRAPHY = [
  "heading-page",
  "heading-page-mobile",
  "heading-card",
  "heading-dialog",
  "display-kpi",
  "body-base",
  "body-sm",
  "body-sm-medium",
  "body-sm-semibold",
  "caption-xs",
  "caption-xs-medium",
]

export const cn = createCn({
  extend: {
    classGroups: {
      "font-size": [{ text: TYPOGRAPHY }],
    },
  },
})
