alias ts-node="./node_modules/.bin/ts-node"
export NODE_PATH=src
case $1 in
  "fetch")
    ts-node src/lexis/B-PageToParse/parsePage $2 refetch
  ;;
  "parse")
    ts-node src/lexis/B-PageToParse/parsePage $2
  ;;
  "collect-lexes")
    ts-node src/lexis/C-ParseToLexis/collectLexes.ts
  ;;
  "make-dict")
    ts-node src/lexis/D-LexisToDict/makeInflectionDict.ts
  ;;
  "analyse-books")
    ts-node src/corpus/analyseBooks.ts $2
  ;;
esac
