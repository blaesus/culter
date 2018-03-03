alias ts-node="./node_modules/.bin/ts-node"
export NODE_PATH=src
case $1 in
  "parse")
    ts-node src/lexis/B-PageToParse/parsePage $2
  ;;
  "fetch")
    ts-node src/lexis/B-PageToParse/parsePage $2 refetch
  ;;
  "analyse-books")
    ts-node src/corpus/analyseBooks.ts
  ;;
  "make-dict")
    ts-node src/lexis/D-LexisToDict/makeInflectionDict.ts
  ;;
esac
