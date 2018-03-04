alias ts-node="./node_modules/.bin/ts-node"
export NODE_PATH=src
case $1 in
  "fetch")
    ts-node src/lexis/B-PageToParse/parsePage $2 refetch
  ;;
  "parse")
    ts-node src/lexis/B-PageToParse/parsePage $2
  ;;
  "parse:all")
    ts-node src/lexis/B-PageToParse/parseAllPages $2
  ;;
  "collect-lexes")
    ts-node src/lexis/C-ParseToLexis/collectLexes.ts $2
  ;;
  "make-dict")
    ts-node src/lexis/D-LexisToDict/makeInflectionDict.ts $2
  ;;
  "analyse-books")
    ts-node src/corpus/analyseBooks.ts $2
  ;;
esac
