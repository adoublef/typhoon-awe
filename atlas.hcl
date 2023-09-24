variable "token" {
    type    = string
    default = getenv("TURSO_TOKEN")
}

variable "url" {
    type    = string
    default = getenv("DATABASE_URL")
}

locals {
    src = ["file://iam/libsql/schema.sql"]
}

env "iam" {
    url     = "${var.url}?authToken=${var.token}"
    dev     = "sqlite://dev?mode=memory&_fk=1"
    src     = local.src
    exclude = ["_litestream*"]
}

env "local" {
    url = "sqlite://typhoon-awe.db?_fk=1"
    dev = "sqlite://dev?mode=memory"
    src = local.src
}
