# Using Turso

---

## Todo

### Groups

Groups decouple the database from Turso's servers.

```bash
$ turso group ${GROUP}
```

To manage the databases inside the group, we can do the following

```bash
# command = create|destroy|list|locations
$ turso group [command]
```

### Extensions

```bash
# turso db create "$(wd)-iam" --enable-extensions --group $(wd)
$ turso db create ${DB} --enable-extensions [--group]
```