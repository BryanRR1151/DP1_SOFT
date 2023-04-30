/*
    Genetic.java
    v1.0
    Created : 29/04/23
    Modified: 29/04/23
*/

package dp1soft.app.logic;

import dp1soft.app.model.*;

import java.util.ArrayList;
import java.util.Random;

//Clase para manejar la lógica del algoritmo genético
public class Genetic {

    //region Constantes
    //Número de generaciones
    private static final int GENERATIONS = 100;
    //Soluciones por generación
    public static final int POPULATION = 100;
    //Porcentaje de la población que serán elegidos como padres
    public static final double PARENTS = 0.5;
    //Porcentaje de mutación
    private static final double MUTATE_CHANCE = 0.05;
    //Porcentaje de ignorar las heurísticas
    public static final double IGNORE_CHANCE = 0.1;
    //endregion

    //region Métodos
    //Método principal para generar una ruta
    public static Solution getBestRoute(Environment env, ArrayList<Vehicle> vehicles, Pack pack, int minute) {
        //Asignar parámetros auxiliares a Solution
        Solution.vehicles = vehicles;
        Solution.pack = pack;
        Solution.currentTime = minute;

        ArrayList<Solution> parents;
        ArrayList<Solution> newPopulation;
        Solution newBest;
        int i;

        //Inicializar la población
        ArrayList<Solution> population = initPopulation(env, vehicles, pack);
        if(population == null){
            //No hubo vehículos disponibles o no se encontró una ruta válida, hay que re-encolar el pedido
            return null;
        }
        Solution best = getFit(population); //Obtener el mejor

        for(i = 0 ; i < GENERATIONS; i++){ //Comenzar la iteración
            parents = Utils.getParents(population); //Obtener padres
            newPopulation = crossPopulation(parents); //Cruzar los padres
            newPopulation = mutate(newPopulation, env, pack); //Mutar la nueva población
            newBest = getFit(newPopulation); //Obtener el mejor de la nueva población
            if(newBest.isBetter(best)){ //Si el nuevo es mejor, se reemplaza la población entera
                best = newBest;
                population = newPopulation;
            }
        }
        return best;
    }
    //Método para generar la población inicial
    private static ArrayList<Solution> initPopulation(Environment env, ArrayList<Vehicle> vehicles, Pack pack){
        ArrayList<Solution> population = new ArrayList<>();
        Solution solution;
        int i, v;
        for(i=0; i < POPULATION; i++){
            v = Utils.pickVehicle(vehicles);
            if(v == Utils.ERROR){
                //No encontró ningún vehículo, no hay soluciones disponibles
                return null;
            }
            solution = getNewSolution(env, vehicles.get(v).getLocation(), pack.getLocation());
            if(solution == null){
                //No se encontró una solución válida, no hay nada que hacer
                return null;
            }
            solution.setiVehicle(v);
            population.add(solution);
        }
        return population;
    }
    //Genera una ruta válida
    private static Solution getNewSolution(Environment env, Node from, Node to){
        Solution solution = new Solution();
        Node localFrom = new Node(from);
        Chrom chrom;
        int num;
        while (!localFrom.equals(to)) { //Mientras no llegue a su destino
            chrom = new Chrom();
            chrom.setFrom(localFrom);
            chrom.setTo(localFrom);
            num = Utils.rollValidMove(env, localFrom, to); //Generar un movimiento válido
            if(num == Utils.ERROR){ //No hay movimientos válidos
                return null;
            }
            switch (num) { //Moverse
                case Utils.RIGHT    -> localFrom.setX(localFrom.getX() + 1);
                case Utils.LEFT     -> localFrom.setX(localFrom.getX() - 1);
                case Utils.UP       -> localFrom.setY(localFrom.getY() + 1);
                case Utils.DOWN     -> localFrom.setY(localFrom.getY() - 1);
            }
            chrom.setTo(localFrom);
            solution.getChroms().add(chrom); //Añadir el movimiento a la solución
        }
        return solution;
    }
    //Obtiene el mejor miembro de la población
    private static Solution getFit(ArrayList<Solution> population) {
        Solution best = population.get(0);
        for(Solution s : population){
            if(s.isBetter(best)){
                best.getChroms().clear();
                best.getChroms().addAll(s.getChroms());
            }
        }
        return best;
    }
    //Cruzar los padres
    private static ArrayList<Solution> crossPopulation(ArrayList<Solution> parents){
        ArrayList<Solution> newPopulation = new ArrayList<>();
        ArrayList<Solution> children;
        Random rand = new Random();
        int i, f, m, parentSize = parents.size();
        for(i = 0 ; i < POPULATION/2; i++){
            f = rand.nextInt(parentSize); //Obtiene un padre aleatorio
            m = Utils.rollValidMother(f); //Obtiene una madre, diferente al padre
            children = Utils.cross(parents.get(f), parents.get(m)); //Obtiene dos hijos
            newPopulation.add(children.get(0));
            newPopulation.add(children.get(1));
        }
        return newPopulation;
    }
    //Mutar un individuo
    private static ArrayList<Solution> mutate (ArrayList<Solution> population, Environment env, Pack pack){
        ArrayList<Solution> newPopulation = new ArrayList<>(population);
        Solution newSolution, regen;
        Node node;
        Random rand = new Random();
        ArrayList<Chrom> chroms;
        int i, j = 0;
        for(Solution s : newPopulation){
            //Itera, hasta que se la probabilidad de mutación se cumpla
            if(rand.nextInt(100) < 100 * MUTATE_CHANCE){
                chroms = s.getChroms();
                if(chroms.size() > 2){ //Si la solución tiene menos de dos pasos, no vale la pena mutar
                    newSolution = new Solution();
                    i = Utils.rollValidIndex(chroms.size()); //No sea ni el primer ni el ultimo paso
                    newSolution.getChroms().addAll(chroms.subList(0, i)); //Sublista con los primeros i pasos
                    node = new Node(newSolution.getChroms().get(i-1).getTo());
                    regen = getNewSolution(env, node, pack.getLocation()); //Regenerar el resto de la ruta
                    if(regen != null){ //Si se encontró una ruta valida, agregar y cambiar
                        newSolution.getChroms().addAll(regen.getChroms());
                        newSolution.setiVehicle(s.getiVehicle());
                        newPopulation.set(j, newSolution);
                    }
                }
            }
            j++;
        }
        return newPopulation;
    }
    //endregion

}
