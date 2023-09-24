env "local" {
    url = "sqlite://typhoon-awe.db?_fk=1"
    dev = "sqlite://file?mode=memory"
    src = ["file://iam/libsql/schema.sql"]
}
