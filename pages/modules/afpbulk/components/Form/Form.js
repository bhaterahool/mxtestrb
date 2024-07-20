import React from 'react'
import { ResetTable } from './ResetTable'
import { Post } from './Post'
import { Save } from './Save'

export const Form = () => (
  <section className="afpbulk__form-save">
    <Post />
    <ResetTable />
    <Save />
  </section>
)
