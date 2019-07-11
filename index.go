package main

import (
  "fmt"
  "html/template"
  "log"
  "net/http"
)

// Serves Index page
func IndexHandler(w http.ResponseWriter, r *http.Request) {
  // Saves program from panic and continues running normally without executing the command if it happens
  defer func() {
    if rec := recover(); rec != nil {
      log.Println(fmt.Sprintf("%v \n\n Err: IndexHandler", rec))
    }
  }()

  // Loads the html & css homepage files
  t, err := template.ParseFiles("index.html")
  if err != nil {
    log.Println(err)
    return
  }
  err = t.Execute(w, nil)
  if err != nil {
    log.Println(err)
    return
  }
}
