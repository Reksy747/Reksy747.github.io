// only this site answers; every other target fails the way a browser fetch to a foreign origin does
const SITE = /^(https?:\/\/)?reksy747\.github\.io(\/(portfolio\.json)?)?$/i

export function simulateCurl(target, data) {
  if (SITE.test(target)) {
    const job = data.experience[0]
    const body = { name: data.identity.name, role: job.role, company: job.company }
    return {
      status: 'HTTP/2 200',
      lines: ['HTTP/2 200', 'content-type: application/json', '', JSON.stringify(body, null, 2)],
    }
  }
  return {
    status: 'curl: (56)',
    lines: [`curl: (56) blocked by CORS policy: no 'Access-Control-Allow-Origin' header is present for ${target}`],
  }
}
