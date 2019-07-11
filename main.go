package main

import (
  "github.com/gorilla/mux"
  "log"
  "net/http"
  "time"
)

// Sets up and serves web Server
func main() {
  r := mux.NewRouter()

  r.HandleFunc("/", IndexHandler)
  r.PathPrefix("/").Handler(http.StripPrefix("/", http.FileServer(http.Dir("."+"/"))))

  srv := &http.Server{
    Handler:      r,
    Addr:         ":80",
    WriteTimeout: 15 * time.Second,
    ReadTimeout:  15 * time.Second,
  }
  go func() {
    if err := srv.ListenAndServe(); err != nil {
      log.Fatal("ListenAndServe: ", err)
    }
  }()
  log.Println("Trivia Game web server is up!")

  <-make(chan struct{})
  return
}
