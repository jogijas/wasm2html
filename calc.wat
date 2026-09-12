(module
  ;; Add two 32-bit floats
  (func $add (param $a f32) (param $b f32) (result f32)
    local.get $a
    local.get $b
    f32.add
  )
  (export "add" (func $add))

  ;; Subtract two 32-bit floats
  (func $subtract (param $a f32) (param $b f32) (result f32)
    local.get $a
    local.get $b
    f32.sub
  )
  (export "subtract" (func $subtract))

  ;; Multiply two 32-bit floats
  (func $multiply (param $a f32) (param $b f32) (result f32)
    local.get $a
    local.get $b
    f32.mul
  )
  (export "multiply" (func $multiply))

  ;; Divide two 32-bit floats
  (func $divide (param $a f32) (param $b f32) (result f32)
    local.get $a
    local.get $b
    f32.div
  )
  (export "divide" (func $divide))

  ;; square root of 32-bit floats
  (func $sqrt (param $a f32) (result f32)
    local.get $a
    f32.sqrt
  )
  (export "sqrt" (func $sqrt))
)
