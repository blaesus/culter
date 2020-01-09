alias ts-node="./node_modules/.bin/ts-node"
export NODE_PATH=src
case $1 in
  "bootstrap")
    ts-node src/lexis/0-Bootstrap/fetchLemmata.ts $2
  ;;
  "fetch")
    ts-node src/lexis/A-WiktionaryToPage/fetchPagesByLemmata $2
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
  "debug")
    ts-node src/lexis/E-Debug/debugForm $2
  ;;
  "tokenize-books")
    ts-node src/corpus/tokenizeBooks.ts $2
  ;;
  "analyse-books")
    ts-node src/corpus/analyseBooks.ts $2
  ;;
  "translate-treebanks")
    ts-node src/corpus/translateTreebanks.ts $2
  ;;
  "execute")
    ts-node $2
  ;;

esac
