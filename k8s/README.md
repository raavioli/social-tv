# SocialTV — k3s deployment

Plain k3s Deployments + Services in the `socialtv` namespace. No Knative.

## Apply

```bash
# from inside WSL Ubuntu
cd /mnt/e/Dev/ai-tv-news
kubectl apply -k k8s/
```

## Build the API image into k3s containerd

```bash
podman build -f apps/api/Dockerfile -t localhost/socialtv-api:dev .
podman save localhost/socialtv-api:dev -o /tmp/socialtv-api.tar
sudo k3s ctr images import /tmp/socialtv-api.tar
rm /tmp/socialtv-api.tar
kubectl -n socialtv rollout restart deploy/socialtv-api
```

## Access

- API inside cluster: `http://socialtv-api.socialtv.svc.cluster.local:3001`
- API via Traefik: `http://socialtv.localhost` (LB at `192.168.1.101`)
- Postgres: `socialtv-postgres:5432`, db/user `socialtv`
- Redis: `socialtv-redis:6379`

## Local dev port-forwards

Host :6379 is taken by CricStat; forward to 6380:

```bash
kubectl -n socialtv port-forward svc/socialtv-postgres 5433:5432 &
kubectl -n socialtv port-forward svc/socialtv-redis    6380:6379 &
kubectl -n socialtv port-forward svc/socialtv-api      3001:3001 &
```

## Real API keys

```bash
kubectl -n socialtv create secret generic socialtv-api-keys \
  --from-literal=OPENAI_API_KEY=sk-... \
  --dry-run=client -o yaml | kubectl apply -f -
kubectl -n socialtv rollout restart deploy/socialtv-api
```
