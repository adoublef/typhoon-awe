# Keeping Secrets

## Infisical

Infisical is a secrets manager that takes on dotenv files directly. 

To set a secret

```bash
# alias ifss
$ infisical secrets set [--env] <key=value>
```

To run a command we will use the following

```bash
# alias ifr
$ infisical run [--env] -- command
```


## GitHub Actions

```bash
# --body reads from an environment variable
# --env deploy to a specific environment
$ gh secret set ${SECRET} [--env] [--body]
```

## Deno Deploy

To load secrets into Deno Deploy we must use the web client



---

## Reference

- [Infisical CLI](https://infisical.com/docs/cli/overview)

- [failed to unlock correct collection '/org/freedesktop/secrets/aliases/default'](https://github.com/hashicorp/boundary/issues/697#issuecomment-709448942)

- [file vault](https://infisical.com/docs/cli/commands/vault)