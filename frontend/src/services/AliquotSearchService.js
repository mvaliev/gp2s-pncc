/*
 * Copyright 2018 Genentech Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @author Przemysław Stankowski on 06.09.2017.
 */

import { HTTP } from '@/utils/http-common'

const PATH = 'project/'

export default class AliquotSearchService {

  findAliquots (projectId, query) {
    return HTTP.get(PATH + projectId + '/aliquots', {
      params: {
        query: query
      }
    })
  }

}