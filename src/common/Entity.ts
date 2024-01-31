import { initModel } from '../plugin/sequelize'
import { DataTypes } from 'sequelize'

export const Test = initModel('test', {
  id: { type: DataTypes.UUID, primaryKey: true },
  name: { type: DataTypes.STRING },
  age: { type: DataTypes.INTEGER }
})
