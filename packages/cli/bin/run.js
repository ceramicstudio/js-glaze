#!/usr/bin/env node

import { flush, run, Errors } from '@oclif/core'

run(void 0, import.meta.url)
  .then(flush)
  .catch(Errors.handle)
