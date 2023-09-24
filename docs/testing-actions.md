# Testing Actions

---

## References

- [nektos/act](https://github.com/nektos/act)

## Todo

### Fixing `unauthorized username or password` 

```bash
# unauthorized: incorrect username or password retrying without them, please check for stale docker config files
```

To rectify this issue, we must delete the existing config and run `docker auth login` manually.

```bash
$ rm ~/.docker/config.json
```

This can be be made better by using [credential stores](https://docs.docker.com/engine/reference/commandline/login/#credential-stores)
