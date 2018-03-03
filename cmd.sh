alias ts-node="./node_modules/.bin/ts-node"
export NODE_PATH=src
case $1 in
  "fetch")
    ts-node src/lexis/B-PageToParse/parsePage $2
  ;;
esac
